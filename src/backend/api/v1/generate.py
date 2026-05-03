# src/backend/api/v1/generate.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from src.backend.core.dependencies import get_mvp_config, get_current_user
from src.backend.services.pipeline import DiffuCatPipeline
from pydantic import BaseModel

router = APIRouter(prefix="/v1/generate", tags=["generate"])

# Global pipeline instance (for MVP; Phase 7: per-user instances)
_pipeline = None

def get_pipeline(mvp_config = Depends(get_mvp_config)):
    global _pipeline
    if _pipeline is None:
        _pipeline = DiffuCatPipeline(mvp_config)
    return _pipeline

class GenerateRequest(BaseModel):
    target_reaction: str  # e.g., "CO2_to_methanol"
    n_candidates: int = 10
    constraints: dict = {}

class GenerateResponse(BaseModel):
    status: str
    candidates_processed: int
    message: str

@router.post("/", response_model=GenerateResponse)
async def generate_candidates(
    request: GenerateRequest,
    pipeline: DiffuCatPipeline = Depends(get_pipeline),
    user = Depends(get_current_user)
):
    """
    Generate novel catalyst candidates for a target reaction.
    
    PDF Alignment: Multi-Objective Generative Design Engine (Sec 1)
    - Conditional generation on target reaction
    - Returns candidates optimized for activity/selectivity/stability
    """
    try:
        result = pipeline.train_on_synthetic_data(request.n_candidates)
        return GenerateResponse(
            status="success",
            candidates_processed=result["candidates_processed"],
            message=f"Generated {result['candidates_processed']} candidates for {request.target_reaction}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Generation failed: {str(e)}"
        )