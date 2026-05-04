# src/validation/engines/mock.py
import time
import numpy as np
import torch
from typing import Dict, Any
from torch_geometric.data import Data
from src.validation.engines.base import BaseDFTEngine
from src.core.logger import setup_logger

logger = setup_logger("validation.engines.mock")

class MockDFTEngine(BaseDFTEngine):
    """
    Mock DFT engine for testing and development.
    Simulates geometry optimization and energy calculations.
    """
    
    def __init__(self, computation_time: float = 2.0):
        self.computation_time = computation_time
        
    def optimize_geometry(self, graph: Data) -> Data:
        """Simulate geometry optimization by adding small noise to positions."""
        time.sleep(self.computation_time * 0.3)  # Simulate compute time
        
        opt_graph = graph.clone()
        # Add small random perturbation to simulate relaxation
        noise = torch.randn_like(opt_graph.pos) * 0.05
        opt_graph.pos = opt_graph.pos + noise
        
        logger.debug(f"🔧 Mock optimization complete for {getattr(graph, 'smiles', 'unknown')}")
        return opt_graph
    
    def calculate_energy(self, graph: Data) -> float:
        """Simulate energy calculation based on molecular complexity."""
        time.sleep(self.computation_time * 0.5)
        
        # Heuristic: More atoms/bonds = higher energy (simplified)
        n_atoms = graph.z.shape[0]
        n_bonds = graph.edge_index.shape[1] // 2  # Undirected edges
        
        # Base energy + complexity penalty + random noise
        base_energy = -5.0  # Typical catalyst binding energy range
        complexity_penalty = n_atoms * 0.1 + n_bonds * 0.05
        noise = np.random.normal(0, 0.1)
        
        energy = base_energy - complexity_penalty + noise
        return float(energy)
    
    def calculate_properties(self, graph: Data) -> Dict[str, Any]:
        """Simulate electronic property calculations."""
        time.sleep(self.computation_time * 0.2)
        
        n_atoms = graph.z.shape[0]
        
        # Mock properties
        homo_lumo_gap = np.random.uniform(1.5, 4.5)  # eV
        dipole_moment = np.random.uniform(0.5, 5.0)   # Debye
        polarizability = n_atoms * 1.5 + np.random.normal(0, 0.5)
        
        return {
            "homo_lumo_gap_ev": float(homo_lumo_gap),
            "dipole_moment_debye": float(dipole_moment),
            "polarizability_au": float(polarizability),
            "method": "MockDFT/B3LYP/6-31G*",
            "basis_set": "6-31G*"
        }