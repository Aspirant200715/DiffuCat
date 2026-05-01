# src/data/processor.py
import torch
from torch_geometric.data import Data
from rdkit import Chem
from rdkit.Chem import AllChem
from typing import List, Optional
import numpy as np
from src.core.config import DiffuCatConfig
from src.core.logger import setup_logger

logger = setup_logger("data.processor")

class MoleculeGraphProcessor:
    """Converts SMILES to validated 3D PyG graphs for SE(3)-equivariant models."""
    
    def __init__(self, cfg: DiffuCatConfig):
        self.cfg = cfg
        self.logger = logger
        self._ensure_dirs()

    def _ensure_dirs(self) -> None:
        from pathlib import Path
        Path(self.cfg.paths_data_processed).mkdir(parents=True, exist_ok=True)

    def smiles_to_mol(self, smiles: str) -> Optional[Chem.Mol]:
        """Parse SMILES, add explicit hydrogens, sanitize."""
        try:
            mol = Chem.MolFromSmiles(smiles)
            if mol is None:
                self.logger.warning(f"Invalid SMILES syntax: {smiles}")
                return None
            # Add Hs & sanitize (catches valency/valence errors)
            mol = Chem.AddHs(mol)
            Chem.SanitizeMol(mol)
            return mol
        except Exception as e:
            self.logger.error(f"Sanitization failed for '{smiles}': {e}")
            return None

    def generate_3d_conformer(self, mol: Chem.Mol) -> Optional[Chem.Mol]:
        """Generate 3D coordinates with MMFF energy minimization."""
        try:
            # ETKDG v3 is state-of-the-art for conformer generation
            params = AllChem.ETKDGv3()
            params.randomSeed = 42
            params.useRandomCoords = True
            success = AllChem.EmbedMolecule(mol, params)
            
            if success != 0:
                self.logger.warning(f"Conformer embedding failed for {Chem.MolToSmiles(mol)}")
                return None
                
            # Quick MMFF optimization to relax steric clashes
            AllChem.MMFFOptimizeMolecule(mol)
            return mol
        except Exception as e:
            self.logger.error(f"3D generation failed: {e}")
            return None

    def mol_to_graph(self, mol: Chem.Mol, y: Optional[torch.Tensor] = None) -> Optional[Data]:
        """Convert RDKit mol to PyG Data object with SE(3)-ready tensors."""
        try:
            if not mol.GetNumConformers():
                return None

            # Node features: atomic numbers (SchNet standard)
            z = torch.tensor([a.GetAtomicNum() for a in mol.GetAtoms()], dtype=torch.long)
            
            # 3D positions (required for equivariant message passing)
            pos = torch.tensor(mol.GetConformer().GetPositions(), dtype=torch.float32)
            
            # Edge construction from bonds
            edge_index, edge_attr = [], []
            for bond in mol.GetBonds():
                i, j = bond.GetBeginAtomIdx(), bond.GetEndAtomIdx()
                edge_index.extend([[i, j], [j, i]])  # Undirected
                # Bond order as continuous feature (1.0=single, 1.5=aromatic, 2.0=double, 3.0=triple)
                bt = float(bond.GetBondTypeAsDouble())
                edge_attr.extend([bt, bt])

            edge_index = torch.tensor(edge_index, dtype=torch.long).t().contiguous()
            edge_attr = torch.tensor(edge_attr, dtype=torch.float32).view(-1, 1)

            data = Data(z=z, pos=pos, edge_index=edge_index, edge_attr=edge_attr)
            if y is not None:
                data.y = y.float()
            return data
        except Exception as e:
            self.logger.error(f"Graph conversion failed: {e}")
            return None

    def process_batch(self, smiles_list: List[str], targets: Optional[List[float]] = None) -> List[Data]:
        """Batch process SMILES → validated 3D graphs."""
        graphs = []
        for i, smi in enumerate(smiles_list):
            mol = self.smiles_to_mol(smi)
            if mol is None: 
                continue
            mol_3d = self.generate_3d_conformer(mol)
            if mol_3d is None: 
                continue

            y = torch.tensor([targets[i]]) if targets else None
            graph = self.mol_to_graph(mol_3d, y=y)
            if graph is not None:
                graphs.append(graph)

        success_rate = len(graphs) / len(smiles_list) if smiles_list else 0
        self.logger.info(f"Processed {len(graphs)}/{len(smiles_list)} molecules ({success_rate:.1%} success)")
        return graphs