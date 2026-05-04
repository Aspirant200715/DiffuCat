
# scripts/run_dft_validation.py
#!/usr/bin/env python3
"""
Run DFT validation on molecular candidates.
PDF Alignment: Tier 2 Validation - Multi-fidelity workflow.
Usage: python scripts/run_dft_validation.py --smiles "CCO,c1ccccc1,CC(=O)O" --engine mock
"""
import sys
import json
import torch
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.config import DiffuCatConfig
from src.core.logger import setup_logger
from src.validation.manager import DFTJobManager
from src.validation.engines.mock import MockDFTEngine
from src.data.processor import MoleculeGraphProcessor

logger = setup_logger("scripts.dft_validation")

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Run DFT validation on molecular candidates")
    parser.add_argument("--smiles", type=str, required=True, help="Comma-separated SMILES strings to validate")
    parser.add_argument("--engine", type=str, default="mock", choices=["mock", "orca"], help="DFT engine to use")
    parser.add_argument("--output", type=str, default="results/dft_validation.json", help="Output JSON path")
    parser.add_argument("--workers", type=int, default=2, help="Parallel workers for DFT jobs")
    args = parser.parse_args()

    # Parse SMILES
    smiles_list = [s.strip() for s in args.smiles.split(",") if s.strip()]
    if not smiles_list:
        logger.error("❌ No valid SMILES provided")
        return 1

    logger.info(f" Starting DFT validation for {len(smiles_list)} candidates")
    logger.info(f"🔧 Engine: {args.engine} | Workers: {args.workers}")

    # Load configuration
    cfg = DiffuCatConfig.load("configs/default.yaml")

    # Initialize DFT engine
    if args.engine == "mock":
        engine = MockDFTEngine(computation_time=0.1)
        logger.info("✅ Mock DFT engine initialized")
    else:
        try:
            from src.validation.engines.orca import ORCADFTEngine
            engine = ORCADFTEngine(functional="PBE", basis="def2-SVP", n_cores=4)
            logger.info("✅ ORCA DFT engine initialized (requires ASE + ORCA software)")
        except ImportError:
            logger.error("❌ ASE not installed. Install with: pip install ase")
            return 1

    # Convert SMILES to PyG graphs
    processor = MoleculeGraphProcessor(cfg)
    logger.info("🔄 Converting SMILES to 3D molecular graphs...")
    graphs = processor.process_batch(smiles_list, targets=None)

    if not graphs:
        logger.error("❌ Failed to generate valid molecular graphs. Check SMILES strings.")
        return 1

    logger.info(f"✅ Successfully generated {len(graphs)} graphs")

    # Run DFT validation
    manager = DFTJobManager(engine=engine, max_workers=args.workers)
    output_dir = "results/dft"
    results = manager.submit_batch(graphs, output_dir=output_dir)

    # Prepare output
    validation_results = {
        "engine": args.engine,
        "candidates_count": len(smiles_list),
        "results_count": len(results),
        "validations": []
    }

    for res in results:
        validation_results["validations"].append({
            "smiles": res.get("smiles"),
            "status": res.get("status"),
            "energy_ev": res.get("energy_ev"),
            "properties": res.get("properties"),
            "error": res.get("error")
        })

    # Save results
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(validation_results, f, indent=2)

    logger.info(f"💾 DFT validation results saved to {output_path}")

    # Print summary
    print("\n" + "="*70)
    print("🔬 DFT VALIDATION SUMMARY")
    print("="*70)
    for i, res in enumerate(results):
        status = res.get("status")
        if status == "completed":
            print(f"\n{i+1}. {res['smiles']}")
            print(f"   ⚡ Energy: {res['energy_ev']:.4f} eV")
            props = res.get("properties", {})
            if props:
                print(f"   🔹 HOMO-LUMO Gap: {props.get('homo_lumo_gap_ev', 'N/A'):.2f} eV")
                print(f"   🔹 Dipole Moment: {props.get('dipole_moment_debye', 'N/A'):.2f} D")
        else:
            print(f"\n{i+1}. {res.get('smiles', 'unknown')}  Failed: {res.get('error', 'Unknown error')}")

    print("\n" + "="*70)
    print(f"✅ Validation complete. {len([r for r in results if r.get('status')=='completed'])}/{len(results)} succeeded")
    print(f"📄 Full results: {output_path}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
