# tests/backend/test_auth.py
import pytest
from datetime import timedelta
from src.backend.core.config import BackendConfig
from src.backend.core.security import (
    get_password_hash, verify_password,
    create_access_token, decode_access_token,
    User, TokenData
)

@pytest.fixture
def cfg():
    return BackendConfig.load("configs/backend.yaml")

def test_password_hashing():
    password = "SecureChemist123!"
    hashed = get_password_hash(password)
    # ✅ bcrypt returns bytes in native implementation
    assert isinstance(hashed, bytes)
    assert verify_password(password, hashed)
    assert not verify_password("wrong", hashed)

def test_access_token_creation(cfg):
    user = User(user_id="chem_001", email="alice@lab.org", role="chemist")
    token = create_access_token(
        data={"sub": user.user_id, "scopes": ["read:candidates"]},
        cfg=cfg,
        expires_delta=timedelta(minutes=5)
    )
    assert isinstance(token, str)
    assert len(token) > 50

def test_access_token_decoding(cfg):
    user = User(user_id="chem_001", email="alice@lab.org", role="chemist")
    token = create_access_token(
        data={"sub": user.user_id, "scopes": ["read:candidates", "write:lab"]},
        cfg=cfg
    )
    token_data = decode_access_token(token, cfg)
    assert token_data is not None
    assert token_data.user_id == user.user_id
    assert "write:lab" in token_data.scopes

def test_invalid_token_decoding(cfg):
    result = decode_access_token("invalid.token.here", cfg)
    assert result is None