# src/backend/main.py
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from src.backend.core.config import BackendConfig
try:
    from src.backend.api.v1 import generate, predict, rank, lab
except Exception:
    generate = predict = rank = lab = None

from src.backend.websockets import visualization

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
    allow_credentials=True,
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
        "version": config.api.version
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
    uvicorn.run("src.backend.main:app", host="127.0.0.1", port=8000, reload=True)