# src/backend/api/v1/rank.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from src.backend.core.dependencies import get_current_user
from src.backend.services.pipeline import DiffuCatPipeline
from src.backend.api.v1.predict import PredictionResult
from pydantic import BaseModel

router = APIRouter(prefix="/v1/rank", tags=["rank"])

# Reuse global pipeline
from src.backend.api.v1.generate import get_pipeline

class RankRequest(BaseModel):
    predictions: List[PredictionResult]

class RankedCandidate(PredictionResult):
    ucb_score: float
    pareto_optimal: bool

class RankResponse(BaseModel):
    ranked_candidates: List[RankedCandidate]

@router.post("/", response_model=RankResponse)
async def rank_candidates(
    request: RankRequest,
    pipeline: DiffuCatPipeline = Depends(get_pipeline),
    user = Depends(get_current_user)
):
    """
    Rank candidates using Pareto optimization + UCB scoring.
    
    PDF Alignment: Multi-Objective Generative Design (Sec 1)
    - Balances activity, selectivity, stability, cost
    - Exploration-exploitation via UCB
    """
    if not request.predictions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="predictions cannot be empty"
        )
        
    try:
        # ✅ Fixed: Use model_dump() instead of dict() for Pydantic v2
        ranked = pipeline.rank_candidates([p.model_dump() for p in request.predictions])
        return RankResponse(ranked_candidates=ranked)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ranking failed: {str(e)}"
        )