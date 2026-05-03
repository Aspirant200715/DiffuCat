# scripts/verify_pipeline.py
"""
Verifies the outputs of the DiffuCat data pipeline.
"""
import torch
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def main():
    print("🔍 Verifying DiffuCat Pipeline Outputs...")

    # 1. Check Processed Dataset
    processed_path = "data/processed/full_dataset.pt"
    if not os.path.exists(processed_path):
        print(f"❌ Processed dataset not found at {processed_path}")
        print("   → Did you run 'python scripts/process_data.py'?")
        return 1
    
    data = torch.load(processed_path, weights_only=False)
    print(f"✅ Processed dataset loaded: {len(data)} graphs")
    
    if hasattr(data[0], 'smiles'):
        print(f"   • Sample SMILES: {data[0].smiles}")
        print(f"   • Has SMILES attr: True")
    else:
        print(f"   • ⚠️  Graph missing SMILES attribute (check processor.py)")

    # 2. Check Splits
    split_dir = "data/processed/splits"
    if not os.path.exists(split_dir):
        print(f"❌ Split directory not found at {split_dir}")
        print("   → Did you run 'python scripts/split_data.py'?")
        return 1
    
    print(f"✅ Split directory found: {split_dir}")
    print("   • Split files:")
    for f in sorted(os.listdir(split_dir)):
        if f.endswith('.pt'):
            path = os.path.join(split_dir, f)
            s = torch.load(path, weights_only=False)
            print(f"     - {f}: {len(s)} graphs")
            
    print("\n🎉 Pipeline verification complete!")
    return 0

if __name__ == "__main__":
    sys.exit(main())