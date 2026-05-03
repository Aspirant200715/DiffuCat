#!/usr/bin/env python3
"""
Start DiffuCat API development server.
"""
import os
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

if __name__ == "__main__":
    # Ensure configs exist
    os.makedirs("configs", exist_ok=True)
    if not os.path.exists("configs/backend.yaml"):
        print("❌ configs/backend.yaml not found. Copy from configs/backend.yaml.example")
        sys.exit(1)
        
    # Start server
    from src.backend.main import app
    import uvicorn
    
    config = app.extra.get("config") or type('obj', (object,), {
        'api': type('obj', (object,), {'host': '0.0.0.0', 'port': 8000})
    })
    
    print(f"🚀 Starting DiffuCat API on http://{config.api.host}:{config.api.port}")
    print(f"📚 Docs available at http://{config.api.host}:{config.api.port}/docs")
    
    uvicorn.run(
        "src.backend.main:app",
        host=config.api.host,
        port=config.api.port,
        reload=True,
        log_level="info"
    )