# src/backend/services/lab_client.py
"""
Abstract interface for laboratory integration.
Supports mock (testing), Opentrons (robotic liquid handler), and custom lab APIs.
PDF Alignment: Collaborative Discovery Platform (Sec 6)
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from datetime import datetime
import asyncio
from src.core.logger import setup_logger

logger = setup_logger("lab_client")

class LabResult:
    """Represents experimental results from lab validation."""
    def __init__(
        self,
        candidate_id: str,
        smiles: str,
        activity: float,
        selectivity: float,
        stability: float,
        synthesis_success: bool,
        notes: str = "",
        timestamp: datetime = None
    ):
        self.candidate_id = candidate_id
        self.smiles = smiles
        self.activity = activity
        self.selectivity = selectivity
        self.stability = stability
        self.synthesis_success = synthesis_success
        self.notes = notes
        self.timestamp = timestamp or datetime.utcnow()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "candidate_id": self.candidate_id,
            "smiles": self.smiles,
            "activity": self.activity,
            "selectivity": self.selectivity,
            "stability": self.stability,
            "synthesis_success": self.synthesis_success,
            "notes": self.notes,
            "timestamp": self.timestamp.isoformat()
        }

class LabClientInterface(ABC):
    """Abstract base class for lab integrations."""
    
    @abstractmethod
    async def submit_candidates(self, candidates: List[Dict[str, Any]]) -> str:
        """
        Submit candidates for experimental validation.
        Returns: Job ID for tracking
        """
        pass
    
    @abstractmethod
    async def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """Get status of submitted job."""
        pass
    
    @abstractmethod
    async def get_results(self, job_id: str) -> Optional[List[LabResult]]:
        """Retrieve experimental results."""
        pass

class MockLabClient(LabClientInterface):
    """
    Mock lab client for testing and development.
    Simulates experimental results with realistic noise.
    """
    
    def __init__(self):
        self.jobs: Dict[str, Dict[str, Any]] = {}
        self.job_counter = 0
        
    async def submit_candidates(self, candidates: List[Dict[str, Any]]) -> str:
        """Simulate submission to lab."""
        self.job_counter += 1
        job_id = f"mock_job_{self.job_counter}"
        
        self.jobs[job_id] = {
            "candidates": candidates,
            "status": "queued",
            "submitted_at": datetime.utcnow(),
            "results": None
        }
        
        logger.info(f"🔬 MockLab: Submitted {len(candidates)} candidates (Job: {job_id})")
        
        # Simulate async processing
        asyncio.create_task(self._simulate_experiment(job_id))
        
        return job_id
    
    async def _simulate_experiment(self, job_id: str):
        """Simulate experimental workflow with delays."""
        import random
        
        # Update status
        self.jobs[job_id]["status"] = "running"
        await asyncio.sleep(2)  # Simulate synthesis time
        
        # Generate mock results
        candidates = self.jobs[job_id]["candidates"]
        results = []
        
        for candidate in candidates:
            # Simulate realistic experimental noise
            base_activity = candidate.get("predicted_activity", 0.7)
            base_selectivity = candidate.get("predicted_selectivity", 0.6)
            base_stability = candidate.get("predicted_stability", 0.8)
            
            # Add noise (±10%)
            noise = 0.1
            actual_activity = max(0, min(1, base_activity + random.uniform(-noise, noise)))
            actual_selectivity = max(0, min(1, base_selectivity + random.uniform(-noise, noise)))
            actual_stability = max(0, min(1, base_stability + random.uniform(-noise, noise)))
            
            # 80% synthesis success rate
            synthesis_success = random.random() > 0.2
            
            result = LabResult(
                candidate_id=candidate.get("smiles", "unknown"),
                smiles=candidate.get("smiles", "unknown"),
                activity=actual_activity,
                selectivity=actual_selectivity,
                stability=actual_stability,
                synthesis_success=synthesis_success,
                notes="Mock experimental result"
            )
            results.append(result)
        
        # Store results
        self.jobs[job_id]["status"] = "completed"
        self.jobs[job_id]["results"] = results
        self.jobs[job_id]["completed_at"] = datetime.utcnow()
        
        logger.info(f"✅ MockLab: Job {job_id} completed with {len(results)} results")
    
    async def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """Get current job status."""
        if job_id not in self.jobs:
            return {"status": "not_found"}
        
        job = self.jobs[job_id]
        return {
            "job_id": job_id,
            "status": job["status"],
            "submitted_at": job["submitted_at"].isoformat(),
            "completed_at": job.get("completed_at", None)
        }
    
    async def get_results(self, job_id: str) -> Optional[List[LabResult]]:
        """Retrieve experimental results."""
        if job_id not in self.jobs:
            return None
        
        return self.jobs[job_id].get("results")

class OpentronsLabClient(LabClientInterface):
    """
    Opentrons robotic liquid handler integration.
    Production implementation for real lab automation.
    """
    
    def __init__(self, api_url: str = "http://localhost:3000"):
        self.api_url = api_url
        self.client = None  # Would initialize Opentrons HTTP client
        
    async def submit_candidates(self, candidates: List[Dict[str, Any]]) -> str:
        """Submit to Opentrons API (placeholder)."""
        logger.warning("Opentrons integration not yet implemented")
        return "opentrons_placeholder"
    
    async def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """Get Opentrons job status (placeholder)."""
        return {"status": "not_implemented"}
    
    async def get_results(self, job_id: str) -> Optional[List[LabResult]]:
        """Get Opentrons results (placeholder)."""
        return None

# Factory function
def get_lab_client(mock_mode: bool = True, config: Dict = None) -> LabClientInterface:
    """
    Factory to create appropriate lab client based on config.
    """
    if mock_mode:
        return MockLabClient()
    else:
        # Production: use real lab API
        api_url = config.get("opentrons_api_url", "http://localhost:3000") if config else "http://localhost:3000"
        return OpentronsLabClient(api_url)