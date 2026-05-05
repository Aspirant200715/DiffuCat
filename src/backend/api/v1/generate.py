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
    candidates: List[str]
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
        generated_smiles = pipeline.generate_novel_candidates(
            target_reaction=request.target_reaction,
            n_candidates=request.n_candidates
        )
        return GenerateResponse(
            status="success",
            candidates=generated_smiles,
            message=f"Successfully generated {len(generated_smiles)} novel catalyst candidates for {request.target_reaction} using DiffuCat Generative AI"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Generation failed: {str(e)}"
        )


class TrainRequest(BaseModel):
    n_candidates: int = 10


class TrainResponse(BaseModel):
    status: str
    candidates_processed: int
    message: str


@router.post("/train", response_model=TrainResponse)
async def train_pipeline(
    request: TrainRequest,
    pipeline: DiffuCatPipeline = Depends(get_pipeline),
    user = Depends(get_current_user)
):
    """
    Train the internal prediction model on synthetic data (development convenience).
    """
    try:
        result = pipeline.train_on_synthetic_data(request.n_candidates)
        return TrainResponse(
            status="trained" if result.get("status") == "trained" else result.get("status"),
            candidates_processed=result.get("candidates_processed", 0),
            message=f"Pipeline trained on {result.get('candidates_processed', 0)} synthetic candidates"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Training failed: {str(e)}"
        )