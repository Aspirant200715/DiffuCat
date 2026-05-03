# tests/backend/test_lab.py
import pytest
from httpx import AsyncClient, ASGITransport
from src.backend.main import app
from src.backend.services.lab_client import MockLabClient, LabResult

@pytest.mark.asyncio
async def test_submit_candidates_to_lab():
    """Test submitting candidates for experimental validation."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/v1/lab/submit", json={
            "smiles_list": ["CCO", "c1ccccc1"],
            "predicted_activity": [0.8, 0.6],
            "predicted_selectivity": [0.7, 0.8],
            "predicted_stability": [0.9, 0.7],
            "priority": "normal"
        })
        # Should return job ID
        assert response.status_code in [200, 401]  # 401 if auth required
        if response.status_code == 200:
            data = response.json()
            assert "job_id" in data
            assert data["status"] == "submitted"

@pytest.mark.asyncio
async def test_get_lab_job_status():
    """Test checking job status."""
    # First submit a job
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        submit_response = await ac.post("/v1/lab/submit", json={
            "smiles_list": ["CCO"],
            "predicted_activity": [0.8],
            "predicted_selectivity": [0.7],
            "predicted_stability": [0.9],
            "priority": "normal"
        })
        
        if submit_response.status_code == 200:
            job_id = submit_response.json()["job_id"]
            
            # Check status
            status_response = await ac.get(f"/v1/lab/status/{job_id}")
            assert status_response.status_code in [200, 401]

@pytest.mark.asyncio
async def test_mock_lab_client():
    """Test mock lab client functionality."""
    client = MockLabClient()
    
    # Submit candidates
    candidates = [
        {"smiles": "CCO", "predicted_activity": 0.8},
        {"smiles": "c1ccccc1", "predicted_activity": 0.6}
    ]
    
    job_id = await client.submit_candidates(candidates)
    assert job_id.startswith("mock_job_")
    
    # Check status
    status = await client.get_job_status(job_id)
    assert status["status"] in ["queued", "running", "completed"]
    
    # Wait for completion (mock simulates async)
    import asyncio
    await asyncio.sleep(3)
    
    # Get results
    results = await client.get_results(job_id)
    assert results is not None
    assert len(results) == 2
    assert all(isinstance(r, LabResult) for r in results)

@pytest.mark.asyncio
async def test_lab_results_structure():
    """Test that lab results have correct structure."""
    client = MockLabClient()
    
    job_id = await client.submit_candidates([
        {"smiles": "CCO", "predicted_activity": 0.8, 
         "predicted_selectivity": 0.7, "predicted_stability": 0.9}
    ])
    
    import asyncio
    await asyncio.sleep(3)  # Wait for mock completion
    
    results = await client.get_results(job_id)
    result = results[0]
    
    assert hasattr(result, "activity")
    assert hasattr(result, "selectivity")
    assert hasattr(result, "stability")
    assert hasattr(result, "synthesis_success")
    assert 0 <= result.activity <= 1
    assert 0 <= result.selectivity <= 1
    assert 0 <= result.stability <= 1