# tests/backend/test_websocket.py
import pytest
from fastapi.testclient import TestClient
from src.backend.main import app

def test_websocket_connection():
    """Test WebSocket connection establishment."""
    client = TestClient(app)
    
    with client.websocket_connect("/ws/viz/test_user") as websocket:
        websocket.send_json({"type": "ping", "timestamp": 123456})
        data = websocket.receive_json()
        assert data["type"] == "pong"
        assert data["timestamp"] == 123456

def test_websocket_subscribe_to_candidate():
    """Test subscribing to candidate updates."""
    client = TestClient(app)
    
    with client.websocket_connect("/ws/viz/test_user") as websocket:
        websocket.send_json({
            "type": "subscribe_to_candidate",
            "candidate_id": "cand_001"
        })
        data = websocket.receive_json()
        assert data["type"] == "subscribed"
        assert data["candidate_id"] == "cand_001"

def test_websocket_request_3d_structure():
    """Test requesting 3D structure data."""
    client = TestClient(app)
    
    with client.websocket_connect("/ws/viz/test_user") as websocket:
        websocket.send_json({
            "type": "request_3d_structure",
            "smiles": "CCO"
        })
        data = websocket.receive_json()
        assert data["type"] == "3d_structure"
        assert data["smiles"] == "CCO"
        assert "data" in data

def test_websocket_disconnect_handling():
    """Test that disconnects are handled gracefully."""
    client = TestClient(app)
    
    with client.websocket_connect("/ws/viz/test_user") as websocket:
        websocket.send_json({"type": "ping", "timestamp": 999})
        data = websocket.receive_json()
        assert data["type"] == "pong"
    # Connection should close cleanly without errors