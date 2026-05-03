# src/data/loaders.py
"""
Real data loading utilities.
Handles ingestion of CSV/HDF5 datasets (e.g., OC20, CatBench) and conversion to PyG graphs.
PDF Alignment: Data Infrastructure, Transfer Learning preparation.
"""
import os
import pandas as pd
import torch
from typing import List, Optional, Iterator
from torch_geometric.data import Data, Dataset
from src.core.config import DiffuCatConfig
from src.data.processor import MoleculeGraphProcessor
from src.core.logger import setup_logger

logger = setup_logger("data.loaders")

class CatalystDataset(Dataset):
    """
    Simple PyG Dataset for Catalyst Discovery.
    Stores graphs in a list for easy indexing and iteration.
    Compatible with PyG DataLoader.
    """
    
    def __init__(self, root: str, config: DiffuCatConfig, process: bool = True):
        self.root = root
        self.config = config
        self._processor = MoleculeGraphProcessor(config)
        self._data_list: List[Data] = []
        
        if process:
            self._process_and_load()
        else:
            self._load_processed()

    def _process_and_load(self):
        """Process raw CSV and load graphs into memory."""
        csv_path = os.path.join(self.root, "catalysts.csv")
        
        if not os.path.exists(csv_path):
            logger.warning(f"CSV not found at {csv_path}. Creating dummy dataset for MVP.")
            # Fallback to synthetic data if file missing (for testing)
            df = pd.DataFrame({
                "smiles": ["CCO", "c1ccccc1", "CC(=O)O"],
                "target_activity": [0.8, 0.6, 0.9],
                "target_selectivity": [0.7, 0.8, 0.6],
                "target_stability": [0.9, 0.7, 0.8]
            })
        else:
            logger.info(f"Loading real dataset from {csv_path}")
            df = pd.read_csv(csv_path)
            
            # Validate columns
            required_cols = ['smiles']
            if not all(col in df.columns for col in required_cols):
                raise ValueError(f"CSV must contain {required_cols}")

        smiles_list = df['smiles'].tolist()
        
        # Extract targets if available
        targets = []
        if all(col in df.columns for col in ['target_activity', 'target_selectivity', 'target_stability']):
            targets = df[['target_activity', 'target_selectivity', 'target_stability']].values.tolist()
        else:
            targets = None
            
        # Process SMILES -> 3D Graphs
        graphs = self._processor.process_batch(smiles_list, targets)
        
        if len(graphs) == 0:
            raise RuntimeError("No valid graphs generated from dataset")
            
        self._data_list = graphs
        logger.info(f"Successfully loaded {len(self._data_list)} molecules.")
        
        # Optionally save processed data for future runs
        self._save_processed()

    def _load_processed(self):
        """Load pre-processed graphs from disk."""
        processed_path = os.path.join(self.root, "processed", "dataset.pt")
        if os.path.exists(processed_path):
            self._data_list = torch.load(processed_path, weights_only=False)
            logger.info(f"Loaded {len(self._data_list)} pre-processed graphs.")
        else:
            logger.warning(f"Processed file not found: {processed_path}")
            self._process_and_load()

    def _save_processed(self):
        """Save processed graphs to disk for future runs."""
        processed_dir = os.path.join(self.root, "processed")
        os.makedirs(processed_dir, exist_ok=True)
        processed_path = os.path.join(processed_dir, "dataset.pt")
        torch.save(self._data_list, processed_path)
        logger.info(f"Saved processed dataset to {processed_path}")

    def __len__(self) -> int:
        """Return number of graphs in dataset."""
        return len(self._data_list)

    def __getitem__(self, idx: int) -> Data:
        """Return the graph at index `idx`."""
        return self._data_list[idx]

    def __iter__(self) -> Iterator[Data]:
        """Allow iteration over dataset."""
        return iter(self._data_list)