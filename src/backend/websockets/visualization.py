# src/backend/websockets/visualization.py
"""
WebSocket handlers for real-time molecular visualization.
MVP: Simplified for TestClient compatibility; production adds auth via middleware.
"""
import json
from typing import Dict, List
from fastapi import WebSocket, WebSocketDisconnect
from src.core.logger import setup_logger

logger = setup_logger("websocket.viz")

class ConnectionManager:
    """Manages WebSocket connections for real-time updates."""
    
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept and register new connection."""
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"🔌 User {user_id} connected")
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        """Remove disconnected client."""
        if user_id in self.active_connections:
            try:
                self.active_connections[user_id].remove(websocket)
            except ValueError:
                pass
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"🔌 User {user_id} disconnected")
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to specific connection."""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Failed to send message: {e}")
    
    async def broadcast_to_user(self, message: dict, user_id: str):
        """Broadcast to all connections of a user."""
        if user_id in self.active_connections:
            for connection in list(self.active_connections[user_id]):
                try:
                    await connection.send_json(message)
                except Exception:
                    try:
                        self.active_connections[user_id].remove(connection)
                    except ValueError:
                        pass

manager = ConnectionManager()

async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """
    Main WebSocket endpoint for molecular visualization.
    MVP: Path parameter only (TestClient-compatible).
    Production: Add auth via FastAPI Depends() or middleware.
    """
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type = message.get("type")
            
            if msg_type == "subscribe_to_candidate":
                candidate_id = message.get("candidate_id")
                await manager.send_personal_message({
                    "type": "subscribed",
                    "candidate_id": candidate_id
                }, websocket)
                
            elif msg_type == "request_3d_structure":
                smiles = message.get("smiles")
                await manager.send_personal_message({
                    "type": "3d_structure",
                    "smiles": smiles,
                    "data": {"atoms": [], "bonds": []}
                }, websocket)
                
            elif msg_type == "ping":
                await manager.send_personal_message({
                    "type": "pong",
                    "timestamp": message.get("timestamp")
                }, websocket)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, user_id)

async def broadcast_ranking_update(user_id: str, ranking_data: dict):
    """Broadcast ranking updates to all connected clients."""
    await manager.broadcast_to_user({
        "type": "ranking_updated",
        "data": ranking_data
    }, user_id)

async def broadcast_property_update(user_id: str, candidate_id: str, properties: dict):
    """Broadcast property prediction updates."""
    await manager.broadcast_to_user({
        "type": "properties_updated",
        "candidate_id": candidate_id,
        "properties": properties
    }, user_id)