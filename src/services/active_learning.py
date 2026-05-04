
# src/services/active_learning.py
"""Active Learning Loop: Incorporates DFT/experimental results to retrain models."""
import torch
import numpy as np
from typing import List, Dict, Any
from torch_geometric.data import Data, DataLoader
from src.core.logger import setup_logger
from src.models.predictor import CatalystPropertyPredictor
from src.training.trainer import CatalystTrainer
from src.core.config import DiffuCatConfig

logger = setup_logger("services.active_learning")

class ActiveLearningLoop:
    """Orchestrates: Predict → Select → Validate → Retrain → Repeat"""
    
    def __init__(self, cfg: DiffuCatConfig, model: CatalystPropertyPredictor):
        self.cfg = cfg
        self.model = model
        self.trainer = CatalystTrainer(cfg, model)
        self.acquisition_history: List[Dict[str, Any]] = []
        
    def select_candidates(
        self,
        candidate_pool: List[Data],
        n_select: int = 10,
        strategy: str = "ucb"
    ) -> List[Data]:
        """Select most informative candidates for validation."""
        import random
        if strategy == "random":
            return random.sample(candidate_pool, min(n_select, len(candidate_pool)))
        
        self.model.eval()
        scores = []
        
        with torch.no_grad():
            for graph in candidate_pool:
                graph_dev = graph.to(self.cfg.training.resolved_device)
                batch_tensor = torch.zeros(graph_dev.z.shape[0], dtype=torch.long, device=graph_dev.z.device)
                edge_attr = graph_dev.edge_attr
                if edge_attr.dim() == 1:
                    edge_attr = edge_attr.unsqueeze(1)
                
                result = self.model.predict_with_uncertainty(
                    graph_dev.z,
                    graph_dev.pos,
                    graph_dev.edge_index,
                    edge_attr,
                    batch_tensor,
                    n_samples=self.cfg.model_uncertainty.mc_samples
                )
                
                if strategy == "ucb":
                    mean = result["mean"][0]
                    std = result["std"][0]
                    kappa = self.cfg.model_uncertainty.kappa
                    score = (mean + kappa * std).sum().item()
                else:
                    score = result["mean"][0].sum().item()
                scores.append((graph, score))
        
        scores.sort(key=lambda x: x[1], reverse=True)
        selected = [g for g, _ in scores[:n_select]]
        logger.info(f"🎯 Selected {len(selected)} candidates via {strategy}")
        return selected
    
    def incorporate_results(
        self,
        validated_results: List[Dict[str, Any]],
        retrain: bool = True
    ) -> Dict[str, Any]:
        """Incorporate validated results into training data."""
        logger.info(f"📥 Incorporating {len(validated_results)} validated results")
        new_data = []
        for result in validated_results:
            if result.get("status") != "completed":
                continue
            graph = Data(
                z=torch.tensor(result.get("atomic_numbers", [6]), dtype=torch.long),
                pos=torch.tensor(result.get("optimized_positions", [[0,0,0]]), dtype=torch.float),
                edge_index=torch.tensor(result.get("edge_index", [[0],[0]]), dtype=torch.long),
                edge_attr=torch.tensor(result.get("edge_attr", [[1.0]]), dtype=torch.float),
                y=torch.tensor([
                    result.get("validated_activity", 0.5),
                    result.get("validated_selectivity", 0.5),
                    result.get("validated_stability", 0.5)
                ], dtype=torch.float).unsqueeze(0),
                smiles=result.get("smiles", "unknown"),
                source="validated"
            )
            new_data.append(graph)
        
        # ✅ FIX: Changed 'new' to 'new_data'
        if not new_data:
            return {"status": "no_valid_data", "retrained": False}
        
        self.acquisition_history.extend(validated_results)
        
        if retrain and len(new_data) >= 2:
            logger.info("🔄 Retraining with new validated data...")
            train_loader = DataLoader(new_data, batch_size=2, shuffle=True)
            self.trainer.train(train_loader, epochs=3)
            return {"status": "retrained", "samples_added": len(new_data)}
        
        return {"status": "data_staged", "samples_added": len(new_data), "retrained": False}
