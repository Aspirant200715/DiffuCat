# src/models/predictor.py
import torch
import torch.nn as nn
from torch_geometric.nn import MessagePassing, global_mean_pool
from torch_geometric.utils import add_self_loops
from typing import Dict, Optional, List
from src.core.config import DiffuCatConfig
from src.core.logger import setup_logger

logger = setup_logger("models.predictor")

class SimpleMPNNConv(MessagePassing):
    """
    Simple message-passing layer compatible with CPU/Windows.
    Replaces SchNet for MVP while preserving SE(3) awareness via pos features.
    """
    def __init__(self, node_feat_dim: int, edge_feat_dim: int, out_channels: int):
        """
        Args:
            node_feat_dim: Dimension of node features (e.g., hidden_channels)
            edge_feat_dim: Dimension of edge features (bond_type + distance = 2)
            out_channels: Output dimension for messages
        """
        super().__init__(aggr='mean')
        # ✅ Fixed: Input dim = node_feat + edge_feat (no extra +1)
        self.lin = nn.Linear(node_feat_dim + edge_feat_dim, out_channels)
        self.root_emb = nn.Embedding(1, out_channels)
        
    def forward(self, x: torch.Tensor, edge_index: torch.Tensor, 
                edge_attr: torch.Tensor, pos: torch.Tensor) -> torch.Tensor:
        # Add self-loops to edge_attr (fill with 1.0 for bond type)
        edge_index, edge_attr = add_self_loops(edge_index, edge_attr, fill_value=1.0)
        
        # Compute relative positions for SE(3) awareness
        row, col = edge_index
        pos_diff = pos[row] - pos[col]  # [num_edges, 3]
        pos_norm = torch.norm(pos_diff, dim=1, keepdim=True)  # [num_edges, 1]
        
        # Edge features: [bond_type (1), distance (1)] = 2 dims
        edge_features = torch.cat([edge_attr, pos_norm], dim=1)  # [num_edges, 2]
        
        return self.propagate(edge_index, x=x, edge_features=edge_features)
    
    def message(self, x_j: torch.Tensor, edge_features: torch.Tensor) -> torch.Tensor:
        # x_j: neighbor node features [num_edges, node_feat_dim]
        # edge_features: [num_edges, edge_feat_dim=2]
        msg_input = torch.cat([x_j, edge_features], dim=1)  # [num_edges, node+edge]
        return self.lin(msg_input)
    
    def update(self, aggr_out: torch.Tensor, x: torch.Tensor) -> torch.Tensor:
        # Add self-loop contribution via learned embedding
        return aggr_out + self.root_emb.weight[0]

class CatalystPropertyPredictor(nn.Module):
    """
    Multi-task GNN predictor with MC Dropout for uncertainty quantification.
    MVP version: Simple MPNN backbone (Windows-compatible, no torch-cluster).
    Production: Swap in SchNet/PaiNN when deploying to Linux/HPC.
    """
    
    def __init__(self, cfg: DiffuCatConfig, num_targets: int = 3):
        super().__init__()
        self.cfg = cfg
        self.num_targets = num_targets  # [activity, selectivity, stability]
        
        # Constants for feature dimensions
        self.node_feat_dim = cfg.model_gnn.hidden_channels  # 64
        self.edge_feat_dim = 2  # [bond_type, distance]
        
        # Node embedding: atomic number → feature vector
        self.node_emb = nn.Embedding(100, self.node_feat_dim)  # Z=1..100
        
        # MPNN layers (num_interactions layers)
        self.convs = nn.ModuleList([
            SimpleMPNNConv(
                node_feat_dim=self.node_feat_dim,
                edge_feat_dim=self.edge_feat_dim,
                out_channels=cfg.model_gnn.hidden_channels
            ) for _ in range(cfg.model_gnn.num_interactions)
        ])
        
        # Multi-task heads: shared representation → task-specific outputs
        self.heads = nn.ModuleDict({
            "activity": nn.Sequential(
                nn.Linear(cfg.model_gnn.hidden_channels, 32),
                nn.ReLU(),
                nn.Dropout(cfg.model_gnn.dropout),
                nn.Linear(32, 1)
            ),
            "selectivity": nn.Sequential(
                nn.Linear(cfg.model_gnn.hidden_channels, 32),
                nn.ReLU(),
                nn.Dropout(cfg.model_gnn.dropout),
                nn.Linear(32, 1)
            ),
            "stability": nn.Sequential(
                nn.Linear(cfg.model_gnn.hidden_channels, 32),
                nn.ReLU(),
                nn.Dropout(cfg.model_gnn.dropout),
                nn.Linear(32, 1)
            )
        })
        
        self.logger = logger

    def forward(self, z: torch.Tensor, pos: torch.Tensor, 
                edge_index: torch.Tensor, edge_attr: torch.Tensor,
                batch: torch.Tensor) -> torch.Tensor:
        """
        Forward pass: graph → pooled representation → task predictions.
        Args:
            z: Atomic numbers [num_nodes]
            pos: 3D coordinates [num_nodes, 3]
            edge_index: Graph connectivity [2, num_edges]
            edge_attr: Bond types [num_edges, 1]
            batch: Batch assignment [num_nodes]
        Returns:
            predictions: [batch_size, num_targets]
        """
        # Node embeddings
        x = self.node_emb(z)  # [num_nodes, node_feat_dim]
        
        # Message passing layers
        for conv in self.convs:
            x = conv(x, edge_index, edge_attr, pos)
            x = torch.relu(x)
        
        # Global mean pooling → graph-level representation
        graph_emb = global_mean_pool(x, batch)  # [batch_size, hidden_channels]
        
        # Task-specific predictions
        predictions = torch.cat([
            self.heads["activity"](graph_emb),
            self.heads["selectivity"](graph_emb),
            self.heads["stability"](graph_emb)
        ], dim=1)  # [batch_size, 3]
        
        return predictions

    def predict_with_uncertainty(
        self, 
        z: torch.Tensor, 
        pos: torch.Tensor,
        edge_index: torch.Tensor,
        edge_attr: torch.Tensor,
        batch: torch.Tensor,
        n_samples: int = None
    ) -> Dict[str, torch.Tensor]:
        """MC Dropout inference: returns mean predictions + epistemic uncertainty."""
        n_samples = n_samples or self.cfg.model_uncertainty.mc_samples
        self.train()  # Keep dropout active for MC sampling
        
        predictions = []
        with torch.no_grad():
            for _ in range(n_samples):
                pred = self.forward(z, pos, edge_index, edge_attr, batch)
                predictions.append(pred.unsqueeze(0))
        
        predictions = torch.cat(predictions, dim=0)  # [n_samples, batch_size, 3]
        mean = predictions.mean(dim=0)  # [batch_size, 3]
        std = predictions.std(dim=0)    # [batch_size, 3]
        ci_95 = 1.96 * std
        
        self.eval()  # Return to eval mode
        return {
            "mean": mean,
            "std": std,
            "ci_95": ci_95,
            "samples": predictions
        }