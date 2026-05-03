# src/data/splitters.py
"""
Advanced data splitting strategies for chemical datasets.
Implements Scaffold Splitting to prevent data leakage of chemical analogs.
PDF Alignment: Active Learning Loop - Robust validation on unseen scaffolds.
"""
import numpy as np
from rdkit import Chem
from rdkit.Chem.Scaffolds import MurckoScaffold
from collections import defaultdict
from typing import List, Tuple
from torch_geometric.data import Data

def generate_scaffolds(smiles_list: List[str]) -> List[str]:
    """
    Generate Murcko Scaffolds for a list of SMILES.
    Returns a list of canonical scaffold SMILES.
    """
    scaffolds = []
    for smi in smiles_list:
        mol = Chem.MolFromSmiles(smi)
        if mol is None:
            scaffolds.append(None)
            continue
        scaffold = MurckoScaffold.MurckoScaffoldSmiles(mol=mol, includeChirality=False)
        scaffolds.append(scaffold)
    return scaffolds

def scaffold_split(
    dataset: List[Data], 
    smiles_list: List[str], 
    frac_train: float = 0.8, 
    frac_val: float = 0.1, 
    frac_test: float = 0.1
) -> Tuple[List[Data], List[Data], List[Data]]:
    """
    Split dataset based on Murcko Scaffolds.
    
    Args:
        dataset: List of PyG Data objects
        smiles_list: Corresponding list of SMILES strings
        frac_train: Fraction of scaffolds for training
        
    Returns:
        train_dataset, val_dataset, test_dataset
    """
    assert len(dataset) == len(smiles_list), "Dataset and SMILES list must be same length"
    
    # 1. Generate scaffolds
    scaffolds = generate_scaffolds(smiles_list)
    
    # 2. Group indices by scaffold
    scaffold_to_indices = defaultdict(list)
    for i, scaffold in enumerate(scaffolds):
        if scaffold is None:
            # Handle invalid molecules (put in test set)
            scaffold_to_indices['invalid'].append(i)
        else:
            scaffold_to_indices[scaffold].append(i)
            
    # 3. Sort scaffolds by frequency (largest first) for balanced splitting
    scaffold_sets = sorted(
        scaffold_to_indices.values(), 
        key=lambda indices: len(indices), 
        reverse=True
    )
    
    # 4. Distribute scaffolds to splits using target counts to avoid empty splits
    n_items = len(dataset)
    target_train = int(round(frac_train * n_items))
    target_val = int(round(frac_val * n_items))
    target_test = n_items - target_train - target_val

    train_indices = []
    val_indices = []
    test_indices = []

    for indices in scaffold_sets:
        # Try to fit group into train/val/test targets without exceeding them
        if len(train_indices) + len(indices) <= target_train:
            train_indices.extend(indices)
            continue
        if len(val_indices) + len(indices) <= target_val:
            val_indices.extend(indices)
            continue
        if len(test_indices) + len(indices) <= target_test:
            test_indices.extend(indices)
            continue

        # If it doesn't fit any target exactly, place into the split with smallest fill ratio
        def fill_ratio(curr, target):
            return (curr / target) if target > 0 else float('inf')

        ratios = {
            'train': fill_ratio(len(train_indices), target_train),
            'val': fill_ratio(len(val_indices), target_val),
            'test': fill_ratio(len(test_indices), target_test)
        }
        # choose split with minimal ratio
        dest = min(ratios, key=ratios.get)
        if dest == 'train':
            train_indices.extend(indices)
        elif dest == 'val':
            val_indices.extend(indices)
        else:
            test_indices.extend(indices)
            
    # 5. Subset datasets
    train_data = [dataset[i] for i in train_indices]
    val_data = [dataset[i] for i in val_indices]
    test_data = [dataset[i] for i in test_indices]
    
    return train_data, val_data, test_data