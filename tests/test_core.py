import pytest
import logging  # ✅ Added missing import
from pathlib import Path
from src.core.config import DiffuCatConfig
from src.core.logger import setup_logger

@pytest.fixture
def cfg():
    return DiffuCatConfig.load("configs/default.yaml")

def test_config_loads_valid_yaml(cfg):
    assert cfg.project_name == "DiffuCat_MVP"
    assert cfg.model_gnn.hidden_channels == 64
    assert cfg.training.resolved_device.type in ("cuda", "cpu")
    assert cfg.model_uncertainty.kappa == pytest.approx(1.5)

def test_config_creates_directories(cfg):
    cfg.ensure_dirs()
    assert Path(cfg.paths_data_raw).exists()
    assert Path(cfg.paths_checkpoints).exists()

def test_logger_initializes():
    logger = setup_logger("test_logger", "DEBUG")
    assert logger.name == "test_logger"
    assert logger.level == logging.DEBUG
    assert any(isinstance(h, logging.StreamHandler) for h in logger.handlers)

def test_logger_no_duplicate_handlers():
    log1 = setup_logger("dup_test")
    log2 = setup_logger("dup_test")
    assert log1 is log2
    assert len(log1.handlers) == 1