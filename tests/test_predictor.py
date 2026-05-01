# tests/test_predictor.py
import pytest
import torch
from torch_geometric.data import Data, Batch
from src.core.config import DiffuCatConfig
from src.models.predictor import CatalystPropertyPredictor


@pytest.fixture
def cfg():
    """Load default configuration for tests."""
    return DiffuCatConfig.load("configs/default.yaml")


@pytest.fixture
def model(cfg):
    """Instantiate predictor with test config."""
    return CatalystPropertyPredictor(cfg)


@pytest.fixture
def dummy_batch():
    """
    Create a minimal valid PyG batch for testing.
    Two graphs: ethanol-like (3 atoms) + benzene-like (6 atoms).
    """
    # Graph 1: Ethanol-like (C-C-O)
    z1 = torch.tensor([6, 6, 8], dtype=torch.long)  # Atomic numbers: C, C, O
    pos1 = torch.randn(3, 3) * 0.5  # Small random 3D coordinates
    edge_index1 = torch.tensor(
        [[0, 1, 1, 2],  # source nodes
         [1, 0, 2, 1]], # target nodes
        dtype=torch.long
    )
    # Edge attributes: bond type [num_edges, 1], dtype float32
    edge_attr1 = torch.tensor([[1.0], [1.0], [1.0], [1.0]], dtype=torch.float32)
    data1 = Data(z=z1, pos=pos1, edge_index=edge_index1, edge_attr=edge_attr1)

    # Graph 2: Benzene-like ring (6 carbons, aromatic bonds)
    z2 = torch.tensor([6] * 6, dtype=torch.long)
    pos2 = torch.randn(6, 3) * 0.5
    edge_index2 = torch.tensor(
        [
            [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 0],  # source
            [1, 0, 2, 1, 3, 2, 4, 3, 5, 4, 0, 5],  # target
        ],
        dtype=torch.long,
    )
    # Aromatic bond type = 1.5
    edge_attr2 = torch.tensor([[1.5]] * 12, dtype=torch.float32)
    data2 = Data(z=z2, pos=pos2, edge_index=edge_index2, edge_attr=edge_attr2)

    # Create proper PyG Batch object
    batch = Batch.from_data_list([data1, data2])
    return batch


def test_model_forward_pass(model, dummy_batch):
    """Verify forward pass produces correct output shape [batch_size, num_targets]."""
    out = model(
        dummy_batch.z,
        dummy_batch.pos,
        dummy_batch.edge_index,
        dummy_batch.edge_attr,
        dummy_batch.batch,
    )
    # Expected: 2 graphs in batch, 3 target properties per graph
    assert out.shape == (2, 3), f"Expected shape (2, 3), got {out.shape}"
    assert torch.isfinite(out).all(), "Output contains NaN or Inf values"


def test_model_gradient_flow(model, dummy_batch):
    """Verify gradients flow through all trainable parameters."""
    model.train()
    out = model(
        dummy_batch.z,
        dummy_batch.pos,
        dummy_batch.edge_index,
        dummy_batch.edge_attr,
        dummy_batch.batch,
    )
    loss = out.sum()
    loss.backward()

    # Check backbone components have gradients
    assert any(
        p.grad is not None for p in model.node_emb.parameters()
    ), "No gradient in node embedding"
    assert any(
        p.grad is not None for p in model.convs.parameters()
    ), "No gradient in MPNN convolutions"

    # Check each task head has gradients
    for head_name, head in model.heads.items():
        assert any(
            p.grad is not None for p in head.parameters()
        ), f"No gradient in {head_name} head"


def test_uncertainty_quantification(model, dummy_batch):
    """Verify MC Dropout produces valid mean predictions and non-zero uncertainty."""
    result = model.predict_with_uncertainty(
        dummy_batch.z,
        dummy_batch.pos,
        dummy_batch.edge_index,
        dummy_batch.edge_attr,
        dummy_batch.batch,
        n_samples=10,  # Fewer samples for faster tests
    )

    # Check output shapes
    assert result["mean"].shape == (2, 3), f"Mean shape mismatch: {result['mean'].shape}"
    assert result["std"].shape == (2, 3), f"Std shape mismatch: {result['std'].shape}"
    assert result["ci_95"].shape == (2, 3), f"CI shape mismatch: {result['ci_95'].shape}"

    # Uncertainty must be non-negative
    assert (result["std"] >= 0).all(), "Standard deviation contains negative values"

    # At least some uncertainty should be > 0 (dropout is stochastic)
    assert (result["std"] > 0).any(), "All uncertainties are zero—dropout may be disabled"


def test_model_eval_mode_deterministic(model, dummy_batch):
    """Verify eval mode produces identical outputs for same input (no dropout)."""
    model.eval()
    with torch.no_grad():
        out1 = model(
            dummy_batch.z,
            dummy_batch.pos,
            dummy_batch.edge_index,
            dummy_batch.edge_attr,
            dummy_batch.batch,
        )
        out2 = model(
            dummy_batch.z,
            dummy_batch.pos,
            dummy_batch.edge_index,
            dummy_batch.edge_attr,
            dummy_batch.batch,
        )
    # Outputs should be bitwise identical in eval mode
    assert torch.allclose(out1, out2, atol=1e-7), "Eval mode outputs are not deterministic"