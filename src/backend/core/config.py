# src/backend/core/config.py
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings
import yaml

class AuthConfig(BaseSettings):
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

class DatabaseConfig(BaseSettings):
    url: str = "sqlite:///./diffucat_mvp.db"
    echo: bool = False

class RedisConfig(BaseSettings):
    url: str = "redis://localhost:6379/0"
    cache_ttl_seconds: int = 300

class LabConfig(BaseSettings):
    mock_mode: bool = True
    opentrons_api_url: str = "http://localhost:3000"
    timeout_seconds: int = 300

class APIConfig(BaseSettings):
    title: str = "DiffuCat API"
    description: str = "Uncertainty-Aware Catalyst Discovery Platform"
    version: str = "0.2.0"
    host: str = "0.0.0.0"
    port: int = 8000
    docs_url: str = "/docs"
    redoc_url: str = "/redoc"

class BackendConfig(BaseSettings):
    api: APIConfig = APIConfig()
    auth: AuthConfig = AuthConfig()
    database: DatabaseConfig = DatabaseConfig()
    redis: RedisConfig = RedisConfig()
    lab: LabConfig = LabConfig()
    
    @classmethod
    def load(cls, path: str = "configs/backend.yaml") -> "BackendConfig":
        with open(path) as f:
            data = yaml.safe_load(f)
        return cls(
            api=APIConfig(**data.get("api", {})),
            auth=AuthConfig(**data.get("auth", {})),
            database=DatabaseConfig(**data.get("database", {})),
            redis=RedisConfig(**data.get("redis", {})),
            lab=LabConfig(**data.get("lab", {}))
        )