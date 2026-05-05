import os
from celery import Celery

# Use Redis as the broker. Fallback to a dummy memory broker if necessary, 
# but Redis is standard for production.
REDIS_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

celery_app = Celery(
    "diffucat_tasks",
    broker=REDIS_URL,
    backend=RESULT_BACKEND,
    include=["src.backend.tasks.predict_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
)
