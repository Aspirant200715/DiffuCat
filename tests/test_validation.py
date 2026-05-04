
# tests/test_validation.py
import pytest
import torch
from torch_geometric.data import Data
from src.validation.engines.mock import MockDFTEngine
from src.validation.manager import DFTJobManager
from src.core.config import DiffuCatConfig

@pytest.fixture
def cfg():
    """Load default configuration for tests."""
    return DiffuCatConfig.load("configs/default.yaml")

@pytest.fixture
def sample_graph():
    """Create a sample PyG graph for testing."""
    return Data(
        z=torch.tensor([6, 6, 8], dtype=torch.long),
        pos=torch.randn(3, 3),
        edge_index=torch.tensor([[0, 1, 1, 2], [1, 0, 2, 1]], dtype=torch.long),
        smiles="CCO"
    )

@pytest.fixture
def engine():
    return MockDFTEngine(computation_time=0.01)

# === Phase 8.1: Mock Engine Tests ===
def test_mock_optimization(engine, sample_graph):
    opt_graph = engine.optimize_geometry(sample_graph)
    assert opt_graph.pos.shape == sample_graph.pos.shape
    assert not torch.allclose(opt_graph.pos, sample_graph.pos)
    assert opt_graph.z.equal(sample_graph.z)

def test_mock_energy_calculation(engine, sample_graph):
    energy = engine.calculate_energy(sample_graph)
    assert isinstance(energy, float)
    assert -10.0 < energy < 0.0

def test_mock_properties(engine, sample_graph):
    props = engine.calculate_properties(sample_graph)
    assert "homo_lumo_gap_ev" in props
    assert "dipole_moment_debye" in props
    assert "polarizability_au" in props
    assert 0 < props["homo_lumo_gap_ev"] < 10

def test_full_validation_workflow(engine, sample_graph):
    result = engine.run_validation(sample_graph)
    assert result["status"] == "completed"
    assert "energy_ev" in result
    assert "properties" in result
    assert result["smiles"] == "CCO"

def test_job_manager_batch_processing(engine, sample_graph):
    graphs = [sample_graph.clone() for _ in range(3)]
    for i, g in enumerate(graphs):
        g.smiles = f"mol_{i}"
    manager = DFTJobManager(engine=engine, max_workers=2)
    results = manager.submit_batch(graphs, output_dir="tests/temp_dft")
    assert len(results) == 3
    assert all(r["status"] == "completed" for r in results)
    top = manager.get_top_candidates(n=2)
    assert len(top) == 2
    import shutil, os
    if os.path.exists("tests/temp_dft"):
        shutil.rmtree("tests/temp_dft")

# === Phase 8.2: ORCA Engine Tests ===
def test_orca_engine_initialization():
    """Test ORCA engine setup (skips if ASE not installed)."""
    # ✅ FIX: Check ASE availability BEFORE importing to avoid NameError
    try:
        import ase
        from ase.calculators.orca import ORCA
    except ImportError:
        pytest.skip("ASE/ORCA not installed - skipping ORCA tests")
    
    from src.validation.engines.orca import ORCADFTEngine
    engine = ORCADFTEngine(
        orca_path="mock_orca",
        functional="PBE",
        basis="def2-SVP",
        n_cores=2
    )
    assert engine.functional == "PBE"
    assert engine.basis == "def2-SVP"

# === Phase 8.3: Active Learning Tests ===
def test_active_learning_selection(cfg):
    """Test candidate selection strategies."""
    from src.services.active_learning import ActiveLearningLoop
    from src.models.predictor import CatalystPropertyPredictor
    from src.data.processor import MoleculeGraphProcessor
    
    processor = MoleculeGraphProcessor(cfg)
    model = CatalystPropertyPredictor(cfg)
    al = ActiveLearningLoop(cfg, model)
    
    smiles = ["CCO", "c1ccccc1", "CC(=O)O"]
    graphs = processor.process_batch(smiles, targets=[[0.8]*3]*3)
    
    if len(graphs) < 2:
        pytest.skip("Could not generate graphs for active learning test")
    
    selected = al.select_candidates(graphs, n_select=2, strategy="ucb")
    assert len(selected) == 2
    
    selected = al.select_candidates(graphs, n_select=2, strategy="greedy")
    assert len(selected) == 2

def test_active_learning_incorporate_results(cfg):
    """Test incorporating validated results."""
    from src.services.active_learning import ActiveLearningLoop
    from src.models.predictor import CatalystPropertyPredictor
    
    model = CatalystPropertyPredictor(cfg)
    al = ActiveLearningLoop(cfg, model)
    
    validated = [
        {
            "status": "completed",
            "smiles": "CCO",
            "atomic_numbers": [6, 6, 8],
            "optimized_positions": [[0,0,0], [1,0,0], [0,1,0]],
            "edge_index": [[0,1,1,2],[1,0,2,1]],
            "edge_attr": [[1.0],[1.0],[1.0],[1.0]],
            "validated_activity": 0.85,
            "validated_selectivity": 0.75,
            "validated_stability": 0.92
        }
    ]
    
    result = al.incorporate_results(validated, retrain=False)
    assert result["status"] == "data_staged"
    assert result["samples_added"] == 1
