# tests/test_processor.py
import pytest
import torch
from torch_geometric.data import Data
from src.core.config import DiffuCatConfig
from src.data.processor import MoleculeGraphProcessor

@pytest.fixture
def cfg():
    return DiffuCatConfig.load("configs/default.yaml")

@pytest.fixture
def processor(cfg):
    return MoleculeGraphProcessor(cfg)

def test_valid_smiles_to_graph(processor):
    smi = "CCO"  # Ethanol
    mol = processor.smiles_to_mol(smi)
    assert mol is not None
    mol_3d = processor.generate_3d_conformer(mol)
    assert mol_3d is not None
    data = processor.mol_to_graph(mol_3d)
    assert isinstance(data, Data)
    assert data.z.shape[0] == data.pos.shape[0]  # Nodes == positions
    assert data.edge_index.shape[0] == 2
    assert data.edge_attr.shape[1] == 1

def test_invalid_smiles_returns_none(processor):
    assert processor.smiles_to_mol("INVALID_SMILES_STRING") is None

def test_3d_coordinates_are_valid(processor):
    smi = "c1ccccc1"  # Benzene
    mol = processor.smiles_to_mol(smi)
    mol_3d = processor.generate_3d_conformer(mol)
    data = processor.mol_to_graph(mol_3d)
    # Must be 3D and finite
    assert data.pos.shape[1] == 3
    assert torch.isfinite(data.pos).all()
    # Aromatic bonds should have type ~1.5
    assert torch.all(data.edge_attr > 0)

def test_batch_processing_with_targets(processor):
    smiles = ["CCO", "c1ccccc1", "CC(=O)O"]
    targets = [0.8, 0.6, 0.9]
    graphs = processor.process_batch(smiles, targets)
    assert len(graphs) == 3
    assert all(isinstance(g, Data) for g in graphs)
    assert all(g.y is not None for g in graphs)
    # ✅ Fixed: Check shape for each graph individually
    for g in graphs:
        assert g.y.shape == (1,), f"Expected shape (1,), got {g.y.shape}"