# src/backend/api/v1/predict.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from src.backend.core.dependencies import get_current_user
from src.backend.services.pipeline import DiffuCatPipeline
from pydantic import BaseModel
from typing import List, Optional, Any
from fastapi import BackgroundTasks
import uuid
import logging

logger = logging.getLogger(__name__)

# Fallback in-memory store if Redis/Celery is down
_fallback_jobs = {}

router = APIRouter(prefix="/v1/predict", tags=["predict"])

# Reuse global pipeline from generate.py
from src.backend.api.v1.generate import get_pipeline

class PredictRequest(BaseModel):
    smiles_list: List[str]

class PredictionResult(BaseModel):
    smiles: str
    predictions: dict
    uncertainty: dict
    synthetic_accessibility: float
    counterfactual_hint: str
    mol_block: Optional[str] = None
    atom_uncertainty: Optional[List[float]] = None
    ucb_score: Optional[float] = None
    pareto_optimal: Optional[bool] = None

class PredictResponse(BaseModel):
    predictions: List[PredictionResult]

class JobSubmitResponse(BaseModel):
    job_id: str
    status: str

class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    result: Optional[PredictResponse] = None
    error: Optional[str] = None

def _run_local_prediction_fallback(job_id: str, smiles_list: List[str], pipeline: DiffuCatPipeline):
    """Fallback runner if Celery is unavailable."""
    try:
        results = pipeline.predict_with_uncertainty(smiles_list)
        if results:
            try:
                results = pipeline.rank_candidates(results)
            except Exception:
                pass
        _fallback_jobs[job_id] = {"status": "SUCCESS", "result": {"predictions": results}}
    except Exception as e:
        _fallback_jobs[job_id] = {"status": "FAILURE", "error": str(e)}

@router.post("/", response_model=PredictResponse)
@router.post("/sync", response_model=PredictResponse)
async def predict_properties_sync(
    request: PredictRequest,
    pipeline: DiffuCatPipeline = Depends(get_pipeline),
    user = Depends(get_current_user)
):
    """Synchronous fallback prediction (legacy)."""
    if not request.smiles_list:
        raise HTTPException(status_code=400, detail="smiles_list cannot be empty")
    try:
        results = pipeline.predict_with_uncertainty(request.smiles_list)
        if results:
            try:
                results = pipeline.rank_candidates(results)
            except Exception:
                pass
        return PredictResponse(predictions=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submit", response_model=JobSubmitResponse)
async def submit_prediction_task(
    request: PredictRequest,
    background_tasks: BackgroundTasks,
    pipeline: DiffuCatPipeline = Depends(get_pipeline),
    user = Depends(get_current_user)
):
    """
    Submit prediction task asynchronously to Celery.
    Gracefully falls back to local BackgroundTasks if Redis is unavailable.
    """
    if not request.smiles_list:
        raise HTTPException(status_code=400, detail="smiles_list cannot be empty")
        
    try:
        from src.backend.tasks.predict_tasks import run_prediction_task
        from celery.exceptions import TimeoutError
        # Try Celery
        task = run_prediction_task.apply_async(args=[request.smiles_list], connect_timeout=1)
        return JobSubmitResponse(job_id=task.id, status="queued")
    except Exception as e:
        logger.warning(f"Celery unavailable ({str(e)}), falling back to local background task.")
        job_id = f"local_{uuid.uuid4().hex}"
        _fallback_jobs[job_id] = {"status": "PENDING"}
        background_tasks.add_task(_run_local_prediction_fallback, job_id, request.smiles_list, pipeline)
        return JobSubmitResponse(job_id=job_id, status="queued_local")

@router.get("/status/{job_id}", response_model=JobStatusResponse)
async def get_prediction_status(job_id: str, user = Depends(get_current_user)):
    """Check status of a prediction job and return results if complete."""
    # Check local fallback first
    if str(job_id).startswith("local_"):
        job = _fallback_jobs.get(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Local job not found")
        
        status = job["status"]
        if status == "SUCCESS":
            return JobStatusResponse(job_id=job_id, status="SUCCESS", result=PredictResponse(**job["result"]))
        elif status == "FAILURE":
            return JobStatusResponse(job_id=job_id, status="FAILURE", error=job.get("error", "Unknown error"))
        return JobStatusResponse(job_id=job_id, status=status)
        
    # Check Celery
    try:
        from celery.result import AsyncResult
        from src.backend.core.celery_app import celery_app
        
        task_result = AsyncResult(job_id, app=celery_app)
        
        if task_result.state == "SUCCESS":
            return JobStatusResponse(
                job_id=job_id, 
                status="SUCCESS", 
                result=PredictResponse(predictions=task_result.result)
            )
        elif task_result.state == "FAILURE":
            return JobStatusResponse(job_id=job_id, status="FAILURE", error=str(task_result.info))
            
        return JobStatusResponse(job_id=job_id, status=task_result.state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check Celery task: {str(e)}")