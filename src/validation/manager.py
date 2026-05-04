# src/validation/manager.py
import os
import json
import time
from typing import List, Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed
from torch_geometric.data import Data
from src.validation.engines.base import BaseDFTEngine
from src.validation.engines.mock import MockDFTEngine
from src.core.logger import setup_logger

logger = setup_logger("validation.manager")

class DFTJobManager:
    """
    Manages batch DFT validation jobs.
    Handles parallel execution, error recovery, and result persistence.
    """
    
    def __init__(self, engine: BaseDFTEngine = None, max_workers: int = 4):
        self.engine = engine or MockDFTEngine()
        self.max_workers = max_workers
        self.results: List[Dict[str, Any]] = []
        
    def submit_batch(self, graphs: List[Data], output_dir: str = "results/dft") -> List[Dict[str, Any]]:
        """
        Submit batch of graphs for DFT validation.
        Returns list of result dictionaries.
        """
        logger.info(f"📤 Submitting {len(graphs)} candidates for DFT validation")
        
        os.makedirs(output_dir, exist_ok=True)
        self.results = []
        
        # Parallel execution
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            futures = {
                executor.submit(self.engine.run_validation, graph): graph 
                for graph in graphs
            }
            
            for future in as_completed(futures):
                graph = futures[future]
                try:
                    result = future.result()
                    self.results.append(result)
                    
                    # Save individual result
                    smiles = result["smiles"].replace("/", "_").replace("\\", "_")
                    result_path = os.path.join(output_dir, f"{smiles}.json")
                    with open(result_path, "w") as f:
                        json.dump(result, f, indent=2)
                        
                except Exception as e:
                    logger.error(f"❌ Validation failed for {getattr(graph, 'smiles', 'unknown')}: {e}")
                    self.results.append({
                        "smiles": getattr(graph, 'smiles', 'unknown'),
                        "status": "failed",
                        "error": str(e)
                    })
        
        logger.info(f"✅ Batch validation complete: {len(self.results)}/{len(graphs)} succeeded")
        return self.results
    
    def get_top_candidates(self, n: int = 10, metric: str = "energy_ev") -> List[Dict[str, Any]]:
        """Get top N candidates based on metric (lower energy = better for binding)."""
        successful = [r for r in self.results if r.get("status") == "completed"]
        sorted_results = sorted(successful, key=lambda x: x.get(metric, float('inf')))
        return sorted_results[:n]
    
    def save_summary(self, path: str = "results/dft/summary.json"):
        """Save batch summary to JSON."""
        summary = {
            "total_submitted": len(self.results),
            "successful": len([r for r in self.results if r.get("status") == "completed"]),
            "failed": len([r for r in self.results if r.get("status") == "failed"]),
            "top_candidates": self.get_top_candidates(n=5),
            "timestamp": time.time()
        }
        
        with open(path, "w") as f:
            json.dump(summary, f, indent=2)
        logger.info(f"💾 Summary saved to {path}")