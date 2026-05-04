#!/usr/bin/env python3
"""
Split processed catalytic datasets using scaffold splitting.
Ensures test set contains structurally distinct molecules for robust evaluation.
PDF Alignment: Active Learning Loop, MLOps & Deployment.
"""
import os
import sys
import torch
from pathlib import Path
from src.core.config import DiffuCatConfig
from src.data.splitters import scaffold_split
from src.core.logger import setup_logger

logger = setup_logger("scripts.split")

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Split catalytic datasets for DiffuCat")
    parser.add_argument("--input", type=str, default="data/processed/full_dataset.pt", help="Path to processed dataset")
    parser.add_argument("--output", type=str, default="data/processed/splits", help="Output directory for splits")
    parser.add_argument("--config", type=str, default="configs/default.yaml", help="Path to config YAML")
    parser.add_argument("--train", type=float, default=0.8, help="Fraction for training")
    parser.add_argument("--val", type=float, default=0.1, help="Fraction for validation")
    parser.add_argument("--test", type=float, default=0.1, help="Fraction for testing")
    
    args = parser.parse_args()
    
    # Validate fractions
    assert abs(args.train + args.val + args.test - 1.0) < 1e-6, "Fractions must sum to 1.0"
    
    # Load processed dataset
    input_path = Path(args.input)
    if not input_path.exists():
        logger.error(f"❌ Processed dataset not found: {input_path}")
        return 1
    
    logger.info(f"📥 Loading processed dataset from {input_path}")
    data_list = torch.load(input_path)
    logger.info(f"✅ Loaded {len(data_list)} graphs")
    
    # ✅ FIX: Extract real SMILES from graph objects
    # Check if SMILES attribute exists (requires re-running process step)
    if not hasattr(data_list[0], 'smiles'):
        logger.error("❌ Graphs do not have 'smiles' attribute. Please re-run 'process' stage with updated processor.py")
        return 1
        
    smiles_list = [data.smiles for data in data_list]
    logger.info(f"🔑 Extracted {len(smiles_list)} SMILES strings")
    
    # Perform scaffold split
    logger.info(f"🔀 Splitting dataset: train={args.train}, val={args.val}, test={args.test}")
    train_data, val_data, test_data = scaffold_split(
        data_list,
        smiles_list,
        frac_train=args.train,
        frac_val=args.val,
        frac_test=args.test
    )
    
    # Save splits
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    splits = {
        "train": train_data,
        "val": val_data,
        "test": test_data
    }
    
    for name, data in splits.items():
        output_path = output_dir / f"{name}.pt"
        torch.save(data, output_path)
        logger.info(f"💾 Saved {name} split: {len(data)} graphs → {output_path}")
    
    # Print summary
    total = len(train_data) + len(val_data) + len(test_data)
    logger.info(f"📊 Split summary: {total} total graphs")
    logger.info(f"   • Train: {len(train_data)} ({len(train_data)/total*100:.1f}%)")
    logger.info(f"   • Val:   {len(val_data)} ({len(val_data)/total*100:.1f}%)")
    logger.info(f"   • Test:  {len(test_data)} ({len(test_data)/total*100:.1f}%)")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())