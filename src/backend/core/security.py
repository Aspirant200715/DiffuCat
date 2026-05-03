# src/backend/core/security.py
from datetime import datetime, timedelta
from typing import Optional
import bcrypt
from jose import JWTError, jwt
from pydantic import BaseModel
from src.backend.core.config import BackendConfig

# ✅ Modern FastAPI standard: use bcrypt directly
def get_password_hash(password: str) -> bytes:
    """Hash a password using bcrypt. Returns bytes."""
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt)

def verify_password(plain: str, hashed: bytes) -> bool:
    """Verify a password against a bcrypt hash."""
    pwd_bytes = plain.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hashed)

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
    scopes: list[str] = []

class User(BaseModel):
    user_id: str
    email: str
    role: str  # "chemist", "admin", "lab_technician"
    disabled: bool = False

def create_access_token(
    data: dict, 
    cfg: BackendConfig,
    expires_delta: Optional[timedelta] = None
) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, cfg.auth.jwt_secret, algorithm=cfg.auth.jwt_algorithm)

def decode_access_token(token: str, cfg: BackendConfig) -> Optional[TokenData]:
    try:
        payload = jwt.decode(token, cfg.auth.jwt_secret, algorithms=[cfg.auth.jwt_algorithm])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return TokenData(user_id=user_id, scopes=payload.get("scopes", []))
    except JWTError:
        return None