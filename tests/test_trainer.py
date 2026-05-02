# tests/test_trainer.py
import pytest
import torch
import os
from torch_geometric.data import Data
from torch_geometric.loader import DataLoader
from src.core.config import DiffuCatConfig
from src.models.predictor import CatalystPropertyPredictor
from src.training.trainer import CatalystTrainer

@pytest.fixture
def cfg():
    return DiffuCatConfig.load("configs/default.yaml")

@pytest.fixture
def model(cfg):
    return CatalystPropertyPredictor(cfg)

@pytest.fixture
def dummy_dataloader():
    """Create a tiny DataLoader for fast, deterministic testing."""
    # Graph 1: Ethanol-like
    d1 = Data(
        z=torch.tensor([6, 6, 8], dtype=torch.long),
        pos=torch.randn(3, 3) * 0.5,
        edge_index=torch.tensor([[0,1,1,2],[1,0,2,1]], dtype=torch.long),
        edge_attr=torch.tensor([[1.0],[1.0],[1.0],[1.0]], dtype=torch.float32),
        y=torch.tensor([[0.8, 0.7, 0.9]], dtype=torch.float32)  # [act, sel, stab]
    )
    # Graph 2: Benzene-like
    d2 = Data(
        z=torch.tensor([6]*6, dtype=torch.long),
        pos=torch.randn(6, 3) * 0.5,
        edge_index=torch.tensor([[0,1,1,2,2,3,3,4,4,5,5,0],[1,0,2,1,3,2,4,3,5,4,0,5]], dtype=torch.long),
        edge_attr=torch.tensor([[1.5]]*12, dtype=torch.float32),
        y=torch.tensor([[0.6, 0.8, 0.7]], dtype=torch.float32)
    )
    return DataLoader([d1, d2], batch_size=1, shuffle=False)

def test_trainer_runs_and_saves_checkpoint(cfg, model, dummy_dataloader, tmp_path):
    """Verify training loop executes, loss computes, and checkpoint saves."""
    trainer = CatalystTrainer(cfg, model)
    cfg.paths_checkpoints = str(tmp_path)  # Redirect to temp dir
    
    trainer.train(dummy_dataloader, epochs=2)
    
    ckpt_path = os.path.join(tmp_path, "best_model.pth")
    assert os.path.exists(ckpt_path), "Checkpoint file was not created"
    
    ckpt = torch.load(ckpt_path, map_location="cpu")
    assert "model_state_dict" in ckpt
    assert "optimizer_state_dict" in ckpt
    assert ckpt["epoch"] in [1, 2]
    assert "config_seed" in ckpt

def test_checkpoint_load_restore(cfg, model, dummy_dataloader, tmp_path):
    """Verify saved checkpoint restores identical model weights."""
    trainer1 = CatalystTrainer(cfg, model)
    cfg.paths_checkpoints = str(tmp_path)
    trainer1.train(dummy_dataloader, epochs=1)
    
    ckpt_path = os.path.join(tmp_path, "best_model.pth")
    assert os.path.exists(ckpt_path)
    
    # Instantiate fresh model & trainer, then load checkpoint
    model2 = CatalystPropertyPredictor(cfg)
    trainer2 = CatalystTrainer(cfg, model2)
    trainer2.load_checkpoint(ckpt_path)
    
    # Compare weights
    for p1, p2 in zip(model.state_dict().values(), model2.state_dict().values()):
        assert torch.allclose(p1, p2, atol=1e-5), "Model weights differ after checkpoint restore"