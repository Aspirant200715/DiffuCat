# src/backend/api/v1/lab.py
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from typing import List, Optional
from pydantic import BaseModel
from src.backend.core.dependencies import get_current_user, get_backend_config
from src.backend.core.config import BackendConfig
from src.backend.services.lab_client import get_lab_client, LabResult
from src.backend.core.security import TokenData
from src.core.logger import setup_logger
from src.backend.api.v1.generate import get_pipeline
from src.backend.services.pipeline import DiffuCatPipeline

logger = setup_logger("api.v1.lab")

router = APIRouter(prefix="/v1/lab", tags=["lab"])

# Global lab client (initialized from config)
_lab_client = None

def get_lab_client_instance(cfg: BackendConfig = Depends(get_backend_config)):
    """Get or create lab client based on config."""
    global _lab_client
    if _lab_client is None:
        _lab_client = get_lab_client(
            mock_mode=cfg.lab.mock_mode,
            config=cfg.lab.model_dump()
        )
    return _lab_client

class CandidateSubmission(BaseModel):
    """Request to submit candidates for experimental validation."""
    smiles_list: List[str]
    predicted_activity: List[float]
    predicted_selectivity: List[float]
    predicted_stability: List[float]
    priority: str = "normal"  # normal, high, urgent

class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    submitted_at: str
    completed_at: Optional[str] = None

class LabResultResponse(BaseModel):
    candidate_id: str
    smiles: str
    activity: float
    selectivity: float
    stability: float
    synthesis_success: bool
    notes: str
    timestamp: str

@router.post("/submit", response_model=dict)
async def submit_for_validation(
    request: CandidateSubmission,
    background_tasks: BackgroundTasks,
    lab_client = Depends(get_lab_client_instance),
    user: TokenData = Depends(get_current_user)
):
    """
    Submit catalyst candidates for experimental validation.
    
    PDF Alignment: Active Learning Loop (Sec 2)
    - Integrates with robotic labs or simulation pipelines
    - Returns job ID for tracking
    """
    if len(request.smiles_list) != len(request.predicted_activity):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="smiles_list and predicted_* arrays must have same length"
        )
    
    # Prepare candidates for submission
    candidates = []
    for i, smi in enumerate(request.smiles_list):
        candidates.append({
            "smiles": smi,
            "predicted_activity": request.predicted_activity[i],
            "predicted_selectivity": request.predicted_selectivity[i],
            "predicted_stability": request.predicted_stability[i],
            "priority": request.priority
        })
    
    # Submit to lab
    job_id = await lab_client.submit_candidates(candidates)
    
    return {
        "status": "submitted",
        "job_id": job_id,
        "candidates_count": len(candidates),
        "message": f"Submitted {len(candidates)} candidates for experimental validation"
    }

@router.get("/status/{job_id}", response_model=JobStatusResponse)
async def get_lab_status(
    job_id: str,
    lab_client = Depends(get_lab_client_instance),
    user: TokenData = Depends(get_current_user)
):
    """Get status of experimental validation job."""
    status_data = await lab_client.get_job_status(job_id)
    
    if status_data.get("status") == "not_found":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job {job_id} not found"
        )
    if "submitted_at" in status_data and hasattr(status_data["submitted_at"], "isoformat"):
        status_data["submitted_at"] = status_data["submitted_at"].isoformat()
    if "completed_at" in status_data and hasattr(status_data["completed_at"], "isoformat"):
        status_data["completed_at"] = status_data["completed_at"].isoformat()
        
    return JobStatusResponse(**status_data)

@router.get("/results/{job_id}", response_model=List[LabResultResponse])
async def get_lab_results(
    job_id: str,
    lab_client = Depends(get_lab_client_instance),
    user: TokenData = Depends(get_current_user)
):
    """
    Retrieve experimental results for a completed job.
    
    PDF Alignment: Active Learning Loop (Sec 2)
    - Results used to retrain models
    - Improves future recommendations
    """
    results = await lab_client.get_results(job_id)
    
    if results is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No results found for job {job_id}"
        )
    
    return [
        LabResultResponse(
            candidate_id=r.candidate_id,
            smiles=r.smiles,
            activity=r.activity,
            selectivity=r.selectivity,
            stability=r.stability,
            synthesis_success=r.synthesis_success,
            notes=r.notes,
            timestamp=r.timestamp.isoformat()
        )
        for r in results
    ]

async def _async_retrain_loop(job_ids: List[str], lab_client, pipeline: DiffuCatPipeline):
    """Background task to fetch completed lab results and run active learning fine-tuning."""
    try:
        smiles_list = []
        targets_list = []
        for job_id in job_ids:
            results = await lab_client.get_results(job_id)
            if results:
                for r in results:
                    # Ignore failed synthesis in training data
                    if r.synthesis_success:
                        smiles_list.append(r.smiles)
                        targets_list.append([r.activity, r.selectivity, r.stability])
        
        if smiles_list:
            logger.info("Active Learning: Fetched " + str(len(smiles_list)) + " valid results from DFT/Lab. Initiating fine-tuning...")
            pipeline.fine_tune(smiles_list, targets_list)
            logger.info("Active Learning loop successfully incorporated new data into the model!")
        else:
            logger.warning("No valid lab results found for the provided job IDs.")
    except Exception as e:
        logger.error(f"❌ Active learning loop failed: {e}")

@router.post("/retrain")
async def trigger_model_retrain(
    job_ids: List[str],
    background_tasks: BackgroundTasks,
    lab_client = Depends(get_lab_client_instance),
    pipeline: DiffuCatPipeline = Depends(get_pipeline),
    user: TokenData = Depends(get_current_user)
):
    """
    Trigger model retraining with new experimental data.
    
    PDF Alignment: Active Learning Loop (Sec 2)
    - Incorporates lab/DFT results into training set
    - Improves model accuracy over time via fine-tuning
    """
    logger.info(f"🔄 Retraining triggered for jobs: {job_ids}")
    
    # Spawn background task so it doesn't block the API
    background_tasks.add_task(_async_retrain_loop, job_ids, lab_client, pipeline)
    
    return {
        "status": "queued",
        "message": f"Active Learning fine-tuning queued for {len(job_ids)} jobs"
    }