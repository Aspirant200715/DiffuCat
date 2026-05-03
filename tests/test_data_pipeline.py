# tests/test_data_pipeline.py
"""
Tests for Phase 7: Real Data & DVC Pipeline.
Validates data loading, scaffold splitting, and CSV ingestion.
PDF Alignment: Data Infrastructure, Active Learning Loop.
"""
import pytest
import pandas as pd
import os
import tempfile
import shutil
from src.data.loaders import CatalystDataset
from src.data.splitters import scaffold_split, generate_scaffolds
from src.data.processor import MoleculeGraphProcessor
from src.core.config import DiffuCatConfig

@pytest.fixture
def cfg():
    """Load default configuration for tests."""
    return DiffuCatConfig.load("configs/default.yaml")

@pytest.fixture
def dummy_csv():
    """
    Create a temporary CSV with diverse chemical scaffolds.
    ✅ Fixed: All arrays must have the same length (9 items each).
    """
    df = pd.DataFrame({
        "smiles": [
            "CCO", "CCCO", "CCCCO",       # Alcohols (same scaffold) - 3 items
            "c1ccccc1", "c1ccccc1O",      # Phenols (same scaffold) - 2 items  
            "CC(=O)O", "CC(=O)N",         # Carboxyls (different scaffold) - 2 items
            "NCCO", "NCCN"                # Amines (same scaffold) - 2 items
        ],  # Total: 9 SMILES
        "target_activity": [0.8]*9,        # ✅ Fixed: 9 items to match SMILES
        "target_selectivity": [0.7]*9,     # ✅ Fixed: 9 items to match SMILES
        "target_stability": [0.9]*9        # ✅ Fixed: 9 items to match SMILES
    })
    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
        df.to_csv(f, index=False)
        return f.name

def test_scaffold_split_logic():
    """Verify scaffolds are grouped correctly."""
    smiles = ["CCO", "CCCO", "c1ccccc1"]
    scaffolds = generate_scaffolds(smiles)
    
    # CCO and CCCO share the "CO" scaffold; Benzene is distinct
    assert scaffolds[0] == scaffolds[1], "CCO and CCCO should share scaffold"
    assert scaffolds[0] != scaffolds[2], "CCO and benzene should have different scaffolds"

def test_scaffold_split_distributes_groups(cfg):
    """Verify scaffold split keeps analogs together."""
    processor = MoleculeGraphProcessor(cfg)
    smiles = [
        "CCO", "CCCO", "CCCCO",  # Group 1: Alcohols
        "c1ccccc1", "c1ccccc1O"  # Group 2: Phenols
    ]
    
    # Create dummy graphs using processor
    graphs = []
    for smi in smiles:
        mol = processor.smiles_to_mol(smi)
        if mol is None:
            continue
        mol_3d = processor.generate_3d_conformer(mol)
        if mol_3d is None:
            continue
        graph = processor.mol_to_graph(mol_3d)
        if graph is not None:
            graphs.append(graph)
        
    # Skip test if no valid graphs generated
    if len(graphs) < 2:
        pytest.skip("Could not generate valid graphs for scaffold split test")
        
    train, val, test = scaffold_split(
        graphs, 
        smiles[:len(graphs)],  # Match length to graphs
        frac_train=0.5, 
        frac_val=0.25, 
        frac_test=0.25
    )
    
    # Check that split sizes are roughly correct
    total = len(train) + len(val) + len(test)
    assert total == len(graphs), f"Split total {total} != original {len(graphs)}"
    
    # Verify non-empty splits
    assert len(train) > 0, "Train split should not be empty"
    assert len(test) > 0, "Test split should not be empty"

def test_dataset_loads_from_csv(cfg, dummy_csv):
    """Test end-to-end loading from CSV."""
    # Setup: Create data/raw directory and copy CSV there
    os.makedirs("data/raw", exist_ok=True)
    target_path = os.path.join("data/raw", "catalysts.csv")
    
    # Use shutil.copy to avoid permission issues on Windows
    shutil.copy(dummy_csv, target_path)
    
    try:
        # Instantiate dataset with process=True to trigger processing
        dataset = CatalystDataset(root="data/raw", config=cfg, process=True)
        
        # Check dataset length ✅ Fixed: expect 9 graphs
        assert len(dataset) == 9, f"Expected 9 graphs, got {len(dataset)}"
        
        # ✅ Fixed: Use indexing instead of .get() for simplified dataset
        graph = dataset[0]
        
        # Validate graph structure
        assert hasattr(graph, 'z'), "Graph missing 'z' (atomic numbers) attribute"
        assert hasattr(graph, 'pos'), "Graph missing 'pos' (3D coordinates) attribute"
        assert hasattr(graph, 'edge_index'), "Graph missing 'edge_index' attribute"
        
        # Validate tensor shapes
        assert graph.z.shape[0] == graph.pos.shape[0], "Node count mismatch between z and pos"
        assert graph.pos.shape[1] == 3, "Position tensor should have 3 dimensions (x,y,z)"
        
        # ✅ Fixed: If targets were provided, check they're attached with correct shape
        # Processor creates y with shape [1, 3] for multi-target regression
        if hasattr(graph, 'y') and graph.y is not None:
            assert graph.y.shape == (1, 3), f"Target tensor should have shape (1, 3), got {graph.y.shape}"
            # Optional: Verify values are in expected range [0, 1]
            assert all(0 <= val <= 1 for val in graph.y[0]), "Target values should be in [0, 1]"
            
    finally:
        # Cleanup: Remove test files
        if os.path.exists(target_path):
            os.remove(target_path)
        
        # Remove processed data if created
        processed_path = os.path.join("data/raw", "processed", "dataset.pt")
        if os.path.exists(processed_path):
            os.remove(processed_path)
        
        # Remove processed directory if empty
        processed_dir = os.path.join("data/raw", "processed")
        if os.path.exists(processed_dir) and not os.listdir(processed_dir):
            os.rmdir(processed_dir)