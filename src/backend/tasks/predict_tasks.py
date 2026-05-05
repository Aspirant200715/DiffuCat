# src/backend/tasks/predict_tasks.py
from celery.utils.log import get_task_logger
from typing import List, Dict, Any
import torch

from src.backend.core.celery_app import celery_app
from src.core.config import DiffuCatConfig
from src.backend.services.pipeline import DiffuCatPipeline

logger = get_task_logger(__name__)

# Global cache for the pipeline in the Celery worker process
_worker_pipeline = None

def get_worker_pipeline() -> DiffuCatPipeline:
    global _worker_pipeline
    if _worker_pipeline is None:
        cfg = DiffuCatConfig.load("configs/default.yaml")
        _worker_pipeline = DiffuCatPipeline(cfg)
        # Ensure it's trained so it can predict (MVP stub)
        _worker_pipeline.train_on_synthetic_data(10)
    return _worker_pipeline

@celery_app.task(name="tasks.predict_properties", bind=True, max_retries=3)
def run_prediction_task(self, smiles_list: List[str]) -> List[Dict[str, Any]]:
    """
    Background task to predict properties and rank candidates.
    Runs asynchronously via Celery so the API doesn't block.
    """
    logger.info(f"🧬 Starting background prediction task for {len(smiles_list)} molecules...")
    try:
        pipeline = get_worker_pipeline()
        
        # Run prediction
        results = pipeline.predict_with_uncertainty(smiles_list)
        
        # Run ranking
        if results:
            results = pipeline.rank_candidates(results)
            
        logger.info("✅ Prediction task completed successfully.")
        return results
    except Exception as e:
        logger.error(f"❌ Prediction task failed: {str(e)}")
        raise self.retry(exc=e, countdown=5)
