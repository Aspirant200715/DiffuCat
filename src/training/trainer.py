# src/training/trainer.py
import os
import torch
import torch.nn as nn
from torch.optim import Adam
from torch_geometric.loader import DataLoader
from typing import Optional
from src.core.config import DiffuCatConfig
from src.core.logger import setup_logger
from src.models.predictor import CatalystPropertyPredictor

logger = setup_logger("training.trainer")

class CatalystTrainer:
    """
    Config-driven training loop for catalyst property prediction.
    Handles multi-task loss, checkpointing, early stopping, and device placement.
    """
    
    def __init__(self, cfg: DiffuCatConfig, model: CatalystPropertyPredictor):
        self.cfg = cfg
        self.device = cfg.training.resolved_device
        self.model = model.to(self.device)
        self.optimizer = Adam(model.parameters(), lr=cfg.training.lr)
        self.best_loss = float("inf")
        self.patience = 5  # Early stopping patience (configurable in future)
        self.patience_counter = 0

    def _train_step(self, batch) -> float:
        """Single forward/backward/optimizer step."""
        batch = batch.to(self.device)
        self.optimizer.zero_grad()
        
        # Forward pass
        pred = self.model(batch.z, batch.pos, batch.edge_index, batch.edge_attr, batch.batch)
        
        # Multi-task MSE loss: [activity, selectivity, stability]
        loss = nn.functional.mse_loss(pred, batch.y)
        loss.backward()
        self.optimizer.step()
        
        return loss.item()

    def train_epoch(self, train_loader: DataLoader) -> float:
        """Run one epoch over the training DataLoader."""
        self.model.train()
        epoch_loss = 0.0
        num_batches = len(train_loader)
        
        for batch in train_loader:
            epoch_loss += self._train_step(batch)
            
        return epoch_loss / num_batches

    def save_checkpoint(self, path: str, epoch: int, loss: float):
        """Save model, optimizer state, and metadata for reproducibility."""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        
        # ✅ Fixed: Remove weights_only for PyTorch < 2.4 compatibility
        # For PyTorch >= 2.4, you can add weights_only=False for security
        checkpoint = {
            "epoch": epoch,
            "model_state_dict": self.model.state_dict(),
            "optimizer_state_dict": self.optimizer.state_dict(),
            "loss": loss,
            "config_seed": self.cfg.seed,
            "model_type": "MPNN_MVP",  # Tracks architecture version
        }
        torch.save(checkpoint, path)
        logger.info(f"💾 Checkpoint saved: {path} (epoch={epoch}, loss={loss:.4f})")

    def load_checkpoint(self, path: str) -> dict:
        """Load weights & optimizer state to resume training or deploy."""
        # ✅ Fixed: Remove weights_only for PyTorch < 2.4 compatibility
        ckpt = torch.load(path, map_location=self.device)
        self.model.load_state_dict(ckpt["model_state_dict"])
        self.optimizer.load_state_dict(ckpt["optimizer_state_dict"])
        logger.info(f"📥 Checkpoint loaded: {path} (resuming from epoch {ckpt['epoch']})")
        return ckpt

    def train(self, train_loader: DataLoader, epochs: Optional[int] = None):
        """Full training loop with logging, checkpointing, and early stopping."""
        epochs = epochs or self.cfg.training.epochs
        logger.info(f"🚀 Starting training for {epochs} epochs on {self.device}")
        
        for epoch in range(1, epochs + 1):
            train_loss = self.train_epoch(train_loader)
            logger.info(f"📈 Epoch {epoch}/{epochs} | Loss: {train_loss:.4f}")

            # Early stopping & best model tracking
            if train_loss < self.best_loss:
                self.best_loss = train_loss
                self.patience_counter = 0
                self.save_checkpoint(
                    os.path.join(self.cfg.paths_checkpoints, "best_model.pth"),
                    epoch, train_loss
                )
            else:
                self.patience_counter += 1
                if self.patience_counter >= self.patience:
                    logger.info(f"⏹ Early stopping triggered at epoch {epoch}")
                    break
                    
        logger.info(f"✅ Training complete. Best loss: {self.best_loss:.4f}")