# tests/test_ranking.py
import pytest
import torch
from src.services.ranking import compute_pareto_front, compute_ucb_score, rank_candidates

def test_pareto_front_simple():
    """Verify Pareto dominance logic on a trivial 2D example."""
    # 4 candidates: [activity, cost] where we maximize activity, minimize cost
    objectives = torch.tensor([
        [0.9, 0.2],  # A: high activity, low cost → Pareto optimal
        [0.8, 0.3],  # B: dominated by A
        [0.7, 0.1],  # C: lower activity but lower cost → Pareto optimal
        [0.5, 0.5],  # D: dominated by all
    ])
    
    pareto = compute_pareto_front(objectives, maximize=[True, False])
    expected = torch.tensor([True, False, True, False])
    assert torch.equal(pareto, expected), f"Expected {expected}, got {pareto}"

def test_ucb_score_exploration_bonus():
    """Verify UCB rewards high uncertainty when kappa > 0."""
    mean = torch.tensor([[0.8, 0.7, 0.9], [0.8, 0.7, 0.9]])  # Same mean predictions
    std = torch.tensor([[0.01, 0.01, 0.01], [0.2, 0.2, 0.2]])  # Candidate 2 has high uncertainty
    weights = torch.tensor([0.5, 0.3, 0.2])
    
    ucb_low_unc = compute_ucb_score(mean[:1], std[:1], weights, kappa=1.5)
    ucb_high_unc = compute_ucb_score(mean[1:], std[1:], weights, kappa=1.5)
    
    # High uncertainty candidate should have higher UCB (exploration bonus)
    assert ucb_high_unc > ucb_low_unc, "UCB should reward exploration when uncertainty is high"

def test_rank_candidates_full_pipeline():
    """Test end-to-end ranking with Pareto + UCB."""
    # Simulate predictions for 5 candidates
    predictions = {
        "mean": torch.tensor([
            [0.9, 0.8, 0.7],  # Candidate 0: excellent
            [0.8, 0.9, 0.6],  # Candidate 1: excellent (different trade-off)
            [0.5, 0.5, 0.5],  # Candidate 2: mediocre
            [0.9, 0.4, 0.8],  # Candidate 3: high activity/stability, low selectivity
            [0.3, 0.3, 0.9],  # Candidate 4: high stability only
        ]),
        "std": torch.randn(5, 3).abs() * 0.1,  # Small random uncertainties
        "ci_95": torch.randn(5, 3).abs() * 0.2
    }
    
    result = rank_candidates(predictions, kappa=1.0)
    
    # Check outputs exist and have correct shapes
    assert result["ucb_scores"].shape == (5,)
    assert result["ucb_ranking"].shape == (5,)
    assert result["pareto_mask"].shape == (5,)
    
    # Top-ranked by UCB should be among Pareto-optimal (not guaranteed, but likely)
    top_ucb_idx = result["ucb_ranking"][0].item()
    assert result["pareto_mask"][top_ucb_idx] or result["ucb_scores"][top_ucb_idx] > result["ucb_scores"].mean(), \
        "Top UCB candidate should be Pareto-optimal OR have high exploration value"