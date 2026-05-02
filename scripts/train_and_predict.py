#!/usr/bin/env python3
"""
DiffuCat MVP: End-to-End Catalyst Discovery Pipeline
Orchestrates: Data → Train → Predict → Uncertainty → Rank → Explain → Simulate Feedback
"""
import sys
import os
import torch
import json
from pathlib import Path
from torch_geometric.loader import DataLoader

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.config import DiffuCatConfig
from src.core.logger import setup_logger
from src.data.processor import MoleculeGraphProcessor
from src.models.predictor import CatalystPropertyPredictor
from src.training.trainer import CatalystTrainer
from src.services.ranking import rank_candidates
from src.services.explainability import compute_synthetic_accessibility, generate_counterfactual_hint

logger = setup_logger("pipeline")

def run_discovery_pipeline(cfg: DiffuCatConfig, n_candidates: int = 10, save_path: str = None):
    """Execute full DiffuCat discovery cycle on synthetic data."""
    logger.info("🚀 Starting DiffuCat MVP discovery pipeline")
    cfg.ensure_dirs()

    # 1️⃣ DATA PREPARATION
    logger.info("📊 Step 1: Processing molecular candidates")
    processor = MoleculeGraphProcessor(cfg)
    
    smiles_pool = [
        "CCO", "c1ccccc1", "CC(=O)O", "NCCO", "CC1=CC=CC=C1",
        "CC(C)O", "C1=CC=C(C=C1)O", "CCN", "CC#N", "CC(=O)N",
        "C1=CC=CC=C1C2=CC=CC=C2", "CC(C)(C)O", "C1=CC=C(C=C1)N",
        "CCOC", "C1=CC=CC=C1O", "CC(=O)OC", "C1=CC=CC=C1C", "CC(C)C",
        "C1=CC=CC=C1Cl", "CCBr"
    ]
    targets = [
        [0.8, 0.7, 0.9], [0.6, 0.8, 0.7], [0.9, 0.6, 0.8], [0.7, 0.9, 0.6], [0.5, 0.5, 0.5],
        [0.8, 0.8, 0.7], [0.7, 0.6, 0.9], [0.6, 0.7, 0.8], [0.9, 0.5, 0.6], [0.5, 0.9, 0.7],
        [0.4, 0.6, 0.8], [0.8, 0.7, 0.5], [0.7, 0.8, 0.6], [0.6, 0.5, 0.9], [0.9, 0.7, 0.8],
        [0.5, 0.8, 0.7], [0.8, 0.6, 0.5], [0.7, 0.9, 0.8], [0.6, 0.7, 0.6], [0.5, 0.5, 0.7]
    ]
    
    graphs = processor.process_batch(smiles_pool[:n_candidates], targets[:n_candidates])
    if not graphs:
        logger.error("❌ Failed to generate valid molecular graphs.")
        return None
    logger.info(f"✅ Processed {len(graphs)}/{n_candidates} candidates")

    # 2️⃣ MODEL TRAINING
    logger.info("🧠 Step 2: Training multi-task property predictor")
    model = CatalystPropertyPredictor(cfg)
    trainer = CatalystTrainer(cfg, model)
    train_loader = DataLoader(graphs, batch_size=2, shuffle=True)
    trainer.train(train_loader, epochs=2)

    # 3️⃣ PREDICTION + UNCERTAINTY
    logger.info("🔮 Step 3: Predicting properties with MC Dropout uncertainty")
    model.eval()
    all_means, all_stds = [], []
    with torch.no_grad():
        for g in graphs:
            loader = DataLoader([g], batch_size=1)
            for batch in loader:  # ✅ Fixed: iterate to get actual batch
                res = model.predict_with_uncertainty(
                    batch.z, batch.pos, batch.edge_index, batch.edge_attr, batch.batch, n_samples=5
                )
                all_means.append(res["mean"][0])
                all_stds.append(res["std"][0])
                break  # Single-item loader

    mean_tensor = torch.stack(all_means)
    std_tensor = torch.stack(all_stds)
    logger.info("✅ Uncertainty-aware predictions generated")

    # 4️⃣ RANKING
    logger.info("🏆 Step 4: Ranking candidates (Pareto + UCB)")
    ranking = rank_candidates(
        {"mean": mean_tensor, "std": std_tensor, "ci_95": std_tensor * 1.96},
        target_weights=torch.tensor([0.5, 0.3, 0.2]),
        kappa=cfg.model_uncertainty.kappa
    )
    top_idx = ranking["ucb_ranking"][:5].tolist()
    logger.info(f"✅ Top 5 UCB candidates: {top_idx}")

    # 5️⃣ EXPLAINABILITY
    logger.info("💡 Step 5: Generating chemist-friendly explanations")
    print("\n" + "="*70)
    print("🧪 DIFFUCAT MVP: TOP CATALYST RECOMMENDATIONS")
    print("="*70)
    for rank, idx in enumerate(top_idx, 1):
        smi = smiles_pool[idx] if idx < len(smiles_pool) else "unknown"
        pred = mean_tensor[idx].numpy()
        unc = std_tensor[idx].numpy()
        mol = processor.smiles_to_mol(smi)
        sa = compute_synthetic_accessibility(mol) if mol else 9.9
        
        print(f"\n#{rank} | {smi}")
        print(f"   📈 Activity: {pred[0]:.2f}±{unc[0]:.2f} | Selectivity: {pred[1]:.2f}±{unc[1]:.2f} | Stability: {pred[2]:.2f}±{unc[2]:.2f}")
        print(f"   🧬 Synthetic Accessibility: {sa:.1f}/10")
        print(f"   ⚖️  Pareto Optimal: {'✅ Yes' if ranking['pareto_mask'][idx] else '❌ No'}")
        print(f"   💡 Chemist Hint: {generate_counterfactual_hint(mol, 'activity', 'increase')}")

    # 6️⃣ ACTIVE LEARNING SIMULATION
    print("\n" + "="*70)
    print("🔄 ACTIVE LEARNING FEEDBACK LOOP (Simulated)")
    print("="*70)
    print("📤 Sending top candidate to virtual lab...")
    simulated_lab = mean_tensor[0].numpy() + torch.randn(3).numpy() * 0.05
    print(f"📥 Lab result received: {simulated_lab}")
    print("✅ In production: Results append to dataset → DVC pipeline triggers → Model retrains")

    # Save results
    if save_path:
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        results = {
            "top_indices": top_idx,
            "predictions": mean_tensor.tolist(),
            "uncertainties": std_tensor.tolist(),
            "pareto_mask": ranking["pareto_mask"].tolist()
        }
        with open(save_path, "w") as f:
            json.dump(results, f, indent=2)
        logger.info(f"💾 Results saved to {save_path}")

    return {"top_indices": top_idx, "mean": mean_tensor, "std": std_tensor, "ranking": ranking}

def main():
    import argparse
    parser = argparse.ArgumentParser(description="DiffuCat MVP Discovery Pipeline")
    parser.add_argument("--config", type=str, default="configs/default.yaml")
    parser.add_argument("--n", type=int, default=10, help="Number of candidates")
    parser.add_argument("--save", type=str, default=None, help="JSON output path")
    args = parser.parse_args()

    cfg = DiffuCatConfig.load(args.config)
    run_discovery_pipeline(cfg, n_candidates=args.n, save_path=args.save)
    return 0

if __name__ == "__main__":
    sys.exit(main())