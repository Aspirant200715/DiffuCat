from pathlib import Path
from typing import Optional
import torch
import yaml
from pydantic_settings import BaseSettings

class GNNConfig(BaseSettings):
    hidden_channels: int = 64
    num_filters: int = 32
    num_interactions: int = 4
    num_gaussians: int = 50
    dropout: float = 0.1

class UncertaintyConfig(BaseSettings):
    mc_samples: int = 20
    kappa: float = 1.5

class TrainingConfig(BaseSettings):
    batch_size: int = 4
    epochs: int = 150
    lr: float = 1e-3
    device: str = "auto"

    @property
    def resolved_device(self) -> torch.device:
        """Abstracts hardware detection for local/cluster portability."""
        if self.device == "auto":
            return torch.device("cuda" if torch.cuda.is_available() else "cpu")
        return torch.device(self.device)

class DiffuCatConfig(BaseSettings):
    """Central configuration schema aligned with DiffuCat architecture."""
    project_name: str = "DiffuCat_MVP"
    version: str = "0.1.0"
    seed: int = 42
    paths_data_raw: str = "data/raw"
    paths_data_processed: str = "data/processed"
    paths_checkpoints: str = "checkpoints"
    paths_logs: str = "logs"
    model_gnn: GNNConfig = GNNConfig()
    model_uncertainty: UncertaintyConfig = UncertaintyConfig()
    training: TrainingConfig = TrainingConfig()

    @classmethod
    def load(cls, path: str = "configs/default.yaml") -> "DiffuCatConfig":
        """Load and validate YAML config."""
        with open(path) as f:
            data = yaml.safe_load(f)
        return cls(
            project_name=data["project"]["name"],
            version=data["project"]["version"],
            seed=data["project"]["seed"],
            paths_data_raw=data["paths"]["data_raw"],
            paths_data_processed=data["paths"]["data_processed"],
            paths_checkpoints=data["paths"]["checkpoints"],
            paths_logs=data["paths"]["logs"],
            model_gnn=GNNConfig(**data["model"]["gnn"]),
            model_uncertainty=UncertaintyConfig(**data["model"]["uncertainty"]),
            training=TrainingConfig(**data["training"])
        )

    def ensure_dirs(self) -> None:
        """Create required directories if they don't exist."""
        for dir_path in [
            self.paths_data_raw,
            self.paths_data_processed,
            self.paths_checkpoints,
            self.paths_logs
        ]:
            Path(dir_path).mkdir(parents=True, exist_ok=True)