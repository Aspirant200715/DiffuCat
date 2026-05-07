# src/backend/main.py
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from src.backend.core.config import BackendConfig
import logging
logger = logging.getLogger(__name__)

generate = None
predict = None
rank = None
lab = None

try:
    from src.backend.api.v1 import generate
    logger.info("Successfully imported generate router")
except Exception as e:
    logger.error(f"Failed to import generate router: {e}")

try:
    from src.backend.api.v1 import predict
    logger.info("Successfully imported predict router")
except Exception as e:
    logger.error(f"Failed to import predict router: {e}")

try:
    from src.backend.api.v1 import rank
    logger.info("Successfully imported rank router")
except Exception as e:
    logger.error(f"Failed to import rank router: {e}")

try:
    from src.backend.api.v1 import lab
    logger.info("Successfully imported lab router")
except Exception as e:
    logger.error(f"Failed to import lab router: {e}")

from src.backend.websockets import visualization

import os
PORT = int(os.environ.get("PORT", 8002))

config = BackendConfig.load("configs/backend.yaml")

app = FastAPI(
    title=config.api.title,
    description=config.api.description,
    version=config.api.version,
    docs_url=config.api.docs_url,
    redoc_url=config.api.redoc_url
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

if generate:
    app.include_router(generate.router)
if predict:
    app.include_router(predict.router)
if rank:
    app.include_router(rank.router)
if lab:
    app.include_router(lab.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to DiffuCat API",
        "docs": "/docs",
        "health": "/health",
        "version": config.api.version,
        "routers": {
            "generate": generate is not None,
            "predict": predict is not None,
            "rank": rank is not None,
            "lab": lab is not None
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": config.api.version}

# ✅ WebSocket endpoint: path parameter only (TestClient-compatible)
@app.websocket("/ws/viz/{user_id}")
async def websocket_viz_endpoint(websocket: WebSocket, user_id: str):
    await visualization.websocket_endpoint(websocket, user_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.backend.main:app", host="0.0.0.0", port=PORT, reload=True)