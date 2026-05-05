# src/data/processor.py
import torch
import numpy as np
from rdkit import Chem
# ✅ FIX: Explicitly import RDKit submodules
from rdkit.Chem import rdDistGeom
from rdkit.Chem import rdForceFieldHelpers
from rdkit.Chem import rdMolDescriptors
from typing import List, Optional
from torch_geometric.data import Data
from src.core.config import DiffuCatConfig
from src.core.logger import setup_logger

logger = setup_logger("data.processor")

class MoleculeGraphProcessor:
    """
    Converts SMILES strings into 3D PyTorch Geometric graphs.
    Handles conformer generation, feature extraction, and graph construction.
    """
    
    def __init__(self, cfg: DiffuCatConfig):
        self.cfg = cfg
        self.seed = cfg.seed if hasattr(cfg, 'seed') else 42

    def smiles_to_mol(self, smiles: str) -> Optional[Chem.Mol]:
        """Convert SMILES to RDKit Mol object."""
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            logger.warning(f"Invalid SMILES: {smiles}")
        return mol

    def generate_3d_conformer(self, mol: Chem.Mol) -> Optional[Chem.Mol]:
        """Generate 3D coordinates using ETKDG v3."""
        mol = Chem.AddHs(mol)
        try:
            # ✅ FIX: Use rdDistGeom directly
            params = rdDistGeom.ETKDGv3()
            params.randomSeed = self.seed
            params.useSmallRingTorsions = True
            params.useMacrocycleTorsions = True
            
            # Generate conformer
            conf_id = rdDistGeom.EmbedMolecule(mol, params)
            if conf_id == -1:
                logger.warning("Failed to embed molecule")
                return None
                
            # Optimize geometry
            # ✅ FIX: Use rdForceFieldHelpers
            rdForceFieldHelpers.MMFFOptimizeMolecule(mol)
            
            return mol
        except Exception as e:
            logger.warning(f"Failed to generate 3D conformer: {e}")
            return None

    def mol_to_graph(self, mol: Chem.Mol) -> Data:
        """Convert RDKit Mol to PyG Data object with 3D positions."""
        # Get atomic numbers
        z = torch.tensor([atom.GetAtomicNum() for atom in mol.GetAtoms()], dtype=torch.long)
        
        # Get 3D positions
        conf = mol.GetConformer()
        pos = torch.tensor(conf.GetPositions(), dtype=torch.float)
        
        # Get edges (adjacency matrix)
        adj = Chem.GetAdjacencyMatrix(mol)
        edge_index = torch.from_numpy(np.array(adj.nonzero())).long()
        
        # Edge attributes (bond type)
        bond_types = []
        for i, j in zip(edge_index[0], edge_index[1]):
            bond = mol.GetBondBetweenAtoms(int(i), int(j))
            if bond is not None:
                bond_types.append(float(bond.GetBondTypeAsDouble()))
            else:
                bond_types.append(1.0)  # Default to single
        
        edge_attr = torch.tensor(bond_types, dtype=torch.float).unsqueeze(1)
        
        return Data(z=z, pos=pos, edge_index=edge_index, edge_attr=edge_attr)

    def process_batch(self, smiles_list: List[str], targets: Optional[List[List[float]]] = None) -> List[Data]:
        """
        Process a list of SMILES into a list of PyG Data objects.
        ✅ Stores SMILES string in graph.smiles attribute for scaffold splitting.
        """
        data_list = []
        for i, smi in enumerate(smiles_list):
            mol = self.smiles_to_mol(smi)
            if mol is None:
                continue
                
            mol_3d = self.generate_3d_conformer(mol)
            if mol_3d is None:
                continue
                
            graph = self.mol_to_graph(mol_3d)
            
            # ✅ CRITICAL FIX: Store SMILES string in graph object
            graph.smiles = smi 
            
            # Add target labels if provided
            if targets is not None:
                t = targets[i]
                if isinstance(t, (list, tuple)):
                    graph.y = torch.tensor(t, dtype=torch.float).unsqueeze(0)  # [1, N]
                else:
                    graph.y = torch.tensor([t], dtype=torch.float)  # [1]
                
            data_list.append(graph)
            
        success_rate = len(data_list) / max(len(smiles_list), 1) * 100
        logger.info(f"Processed {len(data_list)}/{len(smiles_list)} molecules ({success_rate:.1f}% success)")
        return data_list