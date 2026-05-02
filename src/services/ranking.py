# src/services/ranking.py
import torch
from typing import List, Dict, Tuple
from src.core.logger import setup_logger

logger = setup_logger("services.ranking")

def compute_pareto_front(
    objectives: torch.Tensor,  # [num_candidates, num_objectives]
    maximize: List[bool] = None  # Which objectives to maximize vs minimize
) -> torch.Tensor:
    """
    Identify non-dominated candidates on the Pareto front.
    
    Args:
        objectives: Tensor of shape [N, M] where N=candidates, M=objectives
        maximize: List of bools indicating which objectives to maximize.
                  Default: [True, True, False] for [activity, selectivity, cost]
    
    Returns:
        Boolean mask [N] indicating Pareto-optimal candidates
    """
    if maximize is None:
        # Default: maximize activity & selectivity, minimize cost
        maximize = [True, True, False]
    
    # Convert minimization objectives to maximization by negating
    obj_normalized = objectives.clone()
    for i, max_flag in enumerate(maximize):
        if not max_flag:
            obj_normalized[:, i] = -obj_normalized[:, i]
    
    n = len(obj_normalized)
    is_pareto = torch.ones(n, dtype=torch.bool)
    
    for i in range(n):
        for j in range(n):
            if i == j:
                continue
            # j dominates i if j is >= in all objectives and > in at least one
            if torch.all(obj_normalized[j] >= obj_normalized[i]) and \
               torch.any(obj_normalized[j] > obj_normalized[i]):
                is_pareto[i] = False
                break
    
    logger.info(f"Pareto front: {is_pareto.sum().item()}/{n} candidates non-dominated")
    return is_pareto


def compute_ucb_score(
    mean: torch.Tensor,      # [num_candidates, num_targets]
    std: torch.Tensor,       # [num_candidates, num_targets]
    weights: torch.Tensor,   # [num_targets] - importance of each target
    kappa: float = 1.5       # Exploration weight (PDF: Sec 2)
) -> torch.Tensor:
    """
    Upper Confidence Bound scoring for active learning.
    
    UCB = Σ weight_i * (mean_i + kappa * std_i)
    
    High UCB = either high predicted performance OR high uncertainty (exploration value)
    
    Args:
        mean: Mean predictions from MC Dropout
        std: Standard deviation (epistemic uncertainty)
        weights: Relative importance of each target property
        kappa: Exploration-exploitation trade-off parameter
    
    Returns:
        UCB scores [num_candidates]
    """
    # Weighted sum of (mean + kappa * uncertainty)
    ucb_per_target = weights * (mean + kappa * std)
    return ucb_per_target.sum(dim=1)


def rank_candidates(
    predictions: Dict[str, torch.Tensor],  # {"mean", "std", "ci_95"}
    target_weights: torch.Tensor = None,
    kappa: float = 1.5,
    return_pareto: bool = True
) -> Dict[str, torch.Tensor]:
    """
    Full ranking pipeline: Pareto front + UCB scoring + sorted indices.
    
    Aligns with PDF: "Recommends candidates that are either high-confidence high-performance
    (exploitation) OR high-uncertainty high-potential (exploration)"
    """
    mean = predictions["mean"]      # [N, 3]: [activity, selectivity, stability]
    std = predictions["std"]        # [N, 3]
    
    if target_weights is None:
        # Default weights: activity most important, stability least
        target_weights = torch.tensor([0.5, 0.3, 0.2])
    
    # Compute UCB scores for active learning ranking
    ucb_scores = compute_ucb_score(mean, std, target_weights, kappa)
    
    result = {
        "ucb_scores": ucb_scores,
        "ucb_ranking": torch.argsort(ucb_scores, descending=True),
        "mean_predictions": mean,
        "uncertainty": std
    }
    
    # Optional: Pareto front identification
    if return_pareto:
        # Default: maximize activity & selectivity, minimize "cost" (here: 1-stability)
        pareto_mask = compute_pareto_front(
            torch.stack([mean[:, 0], mean[:, 1], -mean[:, 2]], dim=1),
            maximize=[True, True, True]  # All maximized after negating cost
        )
        result["pareto_mask"] = pareto_mask
        result["pareto_indices"] = torch.where(pareto_mask)[0]
        logger.info(f"Identified {pareto_mask.sum().item()} Pareto-optimal candidates")
    
    return result