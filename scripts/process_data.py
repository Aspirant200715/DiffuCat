#!/usr/bin/env python3
"""
Process raw catalytic datasets into PyTorch Geometric format.
Uses CatalystDataset to convert SMILES → 3D graphs with targets.
PDF Alignment: Property Prediction, Data Infrastructure.
"""
import os
import sys
import torch
from pathlib import Path
from src.core.config import DiffuCatConfig
from src.data.loaders import CatalystDataset
from src.core.logger import setup_logger

logger = setup_logger("scripts.process")

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Process catalytic datasets for DiffuCat")
    parser.add_argument("--input", type=str, default="data/raw", help="Input directory with raw CSV")
    parser.add_argument("--output", type=str, default="data/processed", help="Output directory for processed data")
    parser.add_argument("--config", type=str, default="configs/default.yaml", help="Path to config YAML")
    parser.add_argument("--dataset", type=str, default="catalysts.csv", help="Input CSV filename")
    
    args = parser.parse_args()
    
    # Load config
    cfg = DiffuCatConfig.load(args.config)
    
    # Ensure output directory exists
    Path(args.output).mkdir(parents=True, exist_ok=True)
    
    # Copy CSV to expected location for CatalystDataset
    raw_dir = Path(args.input)
    target_csv = raw_dir / "catalysts.csv"
    source_csv = Path(args.input) / args.dataset
    
    if source_csv != target_csv:
        import shutil
        shutil.copy(source_csv, target_csv)
        logger.info(f"📋 Copied {args.dataset} → catalysts.csv")
    
    # Process dataset
    logger.info(f"🔄 Processing {target_csv}...")
    dataset = CatalystDataset(root=str(raw_dir), config=cfg, process=True)
    
    # Save processed data to output directory
    output_path = Path(args.output) / "full_dataset.pt"
    torch.save(dataset._data_list, output_path)  # Access private list for direct save
    logger.info(f"💾 Saved processed dataset to {output_path} ({len(dataset)} graphs)")
    
    # Print summary
    if len(dataset) > 0:
        sample = dataset[0]
        logger.info(f"📊 Sample graph: {sample.num_nodes} nodes, {sample.num_edges} edges")
        if hasattr(sample, 'y') and sample.y is not None:
            logger.info(f"🎯 Targets: {sample.y.shape} = {sample.y[0].tolist()}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())