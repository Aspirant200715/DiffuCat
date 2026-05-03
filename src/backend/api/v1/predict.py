# src/backend/api/v1/predict.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from src.backend.core.dependencies import get_current_user
from src.backend.services.pipeline import DiffuCatPipeline
from pydantic import BaseModel

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

class PredictResponse(BaseModel):
    predictions: List[PredictionResult]

@router.post("/", response_model=PredictResponse)
async def predict_properties(
    request: PredictRequest,
    pipeline: DiffuCatPipeline = Depends(get_pipeline),
    user = Depends(get_current_user)
):
    """
    Predict catalytic properties with uncertainty quantification.
    
    PDF Alignment: Uncertainty Quantification (Sec 2)
    - Bayesian neural networks with confidence intervals
    - Synthetic accessibility scoring
    - Counterfactual explanations
    """
    if not request.smiles_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="smiles_list cannot be empty"
        )
        
    try:
        results = pipeline.predict_with_uncertainty(request.smiles_list)
        return PredictResponse(predictions=results)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )