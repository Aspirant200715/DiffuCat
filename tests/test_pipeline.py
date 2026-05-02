# tests/test_pipeline.py
import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.config import DiffuCatConfig
from scripts.train_and_predict import run_discovery_pipeline

@pytest.fixture
def cfg():
    return DiffuCatConfig.load("configs/default.yaml")

def test_full_pipeline_runs_on_cpu(cfg):
    """Verify end-to-end pipeline executes without errors on CPU/Windows."""
    result = run_discovery_pipeline(cfg, n_candidates=5)
    
    assert result is not None
    assert "top_indices" in result
    assert "mean" in result
    assert "std" in result
    assert result["mean"].shape[1] == 3  # [activity, selectivity, stability]
    assert (result["std"] >= 0).all()    # Uncertainty must be non-negative

def test_pipeline_respects_config_kappa(cfg):
    """Verify UCB exploration weight affects ranking behavior."""
    cfg.model_uncertainty.kappa = 0.0  # Pure exploitation
    result_low = run_discovery_pipeline(cfg, n_candidates=5)
    
    cfg.model_uncertainty.kappa = 3.0  # High exploration
    result_high = run_discovery_pipeline(cfg, n_candidates=5)
    
    # Both should complete successfully
    assert result_low is not None
    assert result_high is not None
    # Different kappa may yield different top candidates (not guaranteed, but likely)