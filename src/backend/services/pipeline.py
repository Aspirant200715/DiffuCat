# src/backend/services/pipeline.py
"""
Orchestrates the core DiffuCat discovery pipeline for API consumption.
Reuses existing MVP components with minimal modification.
"""
import torch
from pathlib import Path
from typing import List, Dict, Any
from torch_geometric.loader import DataLoader

from src.core.config import DiffuCatConfig
from src.data.processor import MoleculeGraphProcessor
from src.models.predictor import CatalystPropertyPredictor
from src.models.diffusion import CatalystDiffusionModel
from src.training.trainer import CatalystTrainer
from src.services.ranking import rank_candidates
from src.services.explainability import compute_synthetic_accessibility, generate_counterfactual_hint

class DiffuCatPipeline:
    """Production-ready wrapper for the MVP discovery pipeline."""
    
    def __init__(self, mvp_config: DiffuCatConfig):
        self.mvp_config = mvp_config
        self.processor = MoleculeGraphProcessor(mvp_config)
        self.model = None
        self._is_trained = False

    def train_on_synthetic_data(self, n_candidates: int = 10) -> Dict[str, Any]:
        """Train model on synthetic data (MVP behavior)."""
        if self._is_trained:
            return {"status": "already_trained"}
            
        # Synthetic data (replace with real datasets in Phase 7)
        smiles_pool = [
            "CCO", "c1ccccc1", "CC(=O)O", "NCCO", "CC1=CC=CC=C1",
            "CC(C)O", "C1=CC=C(C=C1)O", "CCN", "CC#N", "CC(=O)N"
        ]
        targets = [
            [0.8, 0.7, 0.9], [0.6, 0.8, 0.7], [0.9, 0.6, 0.8], [0.7, 0.9, 0.6], [0.5, 0.5, 0.5],
            [0.8, 0.8, 0.7], [0.7, 0.6, 0.9], [0.6, 0.7, 0.8], [0.9, 0.5, 0.6], [0.5, 0.9, 0.7]
        ]
        
        graphs = self.processor.process_batch(
            smiles_pool[:n_candidates], 
            targets[:n_candidates]
        )
        
        if not graphs:
            raise ValueError("Failed to generate valid molecular graphs")
            
        self.model = CatalystPropertyPredictor(self.mvp_config)
        trainer = CatalystTrainer(self.mvp_config, self.model)
        train_loader = DataLoader(graphs, batch_size=2, shuffle=True)
        trainer.train(train_loader, epochs=2)
        
        self._is_trained = True
        return {
            "status": "trained",
            "candidates_processed": len(graphs),
            "epochs": 2
        }

    def fine_tune(self, smiles_list: List[str], targets_list: List[List[float]]) -> Dict[str, Any]:
        """
        Active Learning Loop: Fine-tune the model on new lab-validated results.
        """
        from src.core.logger import setup_logger
        logger = setup_logger("pipeline")
        logger.info(f"🔄 Fine-tuning model on {len(smiles_list)} lab-validated candidates...")
        
        if not self.model:
            self.model = CatalystPropertyPredictor(self.mvp_config)
            
        graphs = self.processor.process_batch(smiles_list, targets_list)
        if not graphs:
            raise ValueError("Failed to process validated SMILES for fine-tuning")
            
        trainer = CatalystTrainer(self.mvp_config, self.model)
        train_loader = DataLoader(graphs, batch_size=2, shuffle=True)
        # Run 3 epochs of fine-tuning to heavily weight the real data
        trainer.train(train_loader, epochs=3)
        
        self._is_trained = True
        logger.info("✅ Model fine-tuning complete.")
        return {
            "status": "fine_tuned",
            "candidates_processed": len(graphs),
            "epochs_run": 3
        }

    def generate_novel_candidates(self, target_reaction: str, n_candidates: int = 10) -> List[str]:
        """Generate novel catalyst SMILES using the diffusion model."""
        # Instantiate the generative model
        diffusion_model = CatalystDiffusionModel(
            latent_dim=self.mvp_config.model_gnn.hidden_channels,
            timesteps=100
        )
        diffusion_model.to(self.mvp_config.training.resolved_device)
        
        # Run reverse diffusion sampling
        generated_smiles = diffusion_model.sample(
            target_reaction=target_reaction,
            n_candidates=n_candidates,
            device=self.mvp_config.training.resolved_device
        )
        
        return generated_smiles

    def predict_with_uncertainty(self, smiles_list: List[str]) -> List[Dict[str, Any]]:
        """Predict properties + uncertainty for given SMILES."""
        if not self._is_trained or self.model is None:
            raise RuntimeError("Model must be trained first. Call /train endpoint.")
            
        graphs = []
        for smi in smiles_list:
            mol = self.processor.smiles_to_mol(smi)
            if mol is None:
                continue
            mol_3d = self.processor.generate_3d_conformer(mol)
            if mol_3d is None:
                continue
            graph = self.processor.mol_to_graph(mol_3d)
            if graph is not None:
                graphs.append((smi, graph))
        
        results = []
        self.model.eval()
        with torch.no_grad():
            for smi, g in graphs:
                loader = DataLoader([g], batch_size=1)
                for batch in loader:
                    res = self.model.predict_with_uncertainty(
                        batch.z, batch.pos, batch.edge_index, batch.edge_attr, batch.batch,
                        n_samples=self.mvp_config.model_uncertainty.mc_samples
                    )
                    
                    # Explainability
                    mol = self.processor.smiles_to_mol(smi)
                    sa_score = compute_synthetic_accessibility(mol) if mol else 9.9
                    
                    results.append({
                        "smiles": smi,
                        "predictions": {
                            "activity": float(res["mean"][0][0]),
                            "selectivity": float(res["mean"][0][1]),
                            "stability": float(res["mean"][0][2])
                        },
                        "uncertainty": {
                            "activity": float(res["std"][0][0]),
                            "selectivity": float(res["std"][0][1]),
                            "stability": float(res["std"][0][2])
                        },
                        "synthetic_accessibility": float(sa_score),
                        "counterfactual_hint": generate_counterfactual_hint(mol, "activity", "increase") if mol else ""
                    })
                    break
        
        return results

    def rank_candidates(self, predictions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Apply Pareto + UCB ranking to predictions."""
        if not predictions:
            return []
            
        # Convert to tensors for ranking service
        mean_tensor = torch.tensor([
            [p["predictions"]["activity"], p["predictions"]["selectivity"], p["predictions"]["stability"]]
            for p in predictions
        ])
        std_tensor = torch.tensor([
            [p["uncertainty"]["activity"], p["uncertainty"]["selectivity"], p["uncertainty"]["stability"]]
            for p in predictions
        ])
        
        ranking_result = rank_candidates(
            {"mean": mean_tensor, "std": std_tensor, "ci_95": std_tensor * 1.96},
            target_weights=torch.tensor([0.5, 0.3, 0.2]),
            kappa=self.mvp_config.model_uncertainty.kappa
        )
        
        # Add ranking scores to predictions
        ucb_scores = ranking_result["ucb_scores"].tolist()
        pareto_mask = ranking_result["pareto_mask"].tolist()
        
        for i, pred in enumerate(predictions):
            pred["ucb_score"] = ucb_scores[i]
            pred["pareto_optimal"] = pareto_mask[i]
            
        # Sort by UCB score (descending)
        ranked = sorted(predictions, key=lambda x: x["ucb_score"], reverse=True)
        return ranked