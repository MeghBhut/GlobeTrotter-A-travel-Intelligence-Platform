"""Password hashing + JWT tokens + the 'who is logged in?' dependency.

Implemented with the Python standard library only (hashlib pbkdf2 + hmac-signed
JWT) so the backend installs with zero native/Rust builds on any Python version.
"""
import base64
import hashlib
import hmac
import json
import os
import time

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from .database import get_db
from . import models

# In a real app keep this secret + in an env var. Fine for a local prototype.
SECRET_KEY = "globetrotter-dev-secret-change-me"
TOKEN_EXPIRE_DAYS = 7
PBKDF2_ITERATIONS = 200_000

bearer_scheme = HTTPBearer()


# ---------- password hashing (pbkdf2-sha256) ----------
def hash_password(password: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PBKDF2_ITERATIONS)
    return "pbkdf2_sha256${}${}${}".format(
        PBKDF2_ITERATIONS,
        base64.b64encode(salt).decode(),
        base64.b64encode(dk).decode(),
    )


def verify_password(plain: str, stored: str) -> bool:
    try:
        _algo, iters, salt_b64, dk_b64 = stored.split("$")
        salt = base64.b64decode(salt_b64)
        expected = base64.b64decode(dk_b64)
        dk = hashlib.pbkdf2_hmac("sha256", plain.encode(), salt, int(iters))
        return hmac.compare_digest(dk, expected)
    except Exception:
        return False


# ---------- minimal HS256 JWT ----------
def _b64url(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()


def _b64url_decode(seg: str) -> bytes:
    return base64.urlsafe_b64decode(seg + "=" * (-len(seg) % 4))


def create_token(user_id: int) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {"sub": str(user_id), "exp": int(time.time()) + TOKEN_EXPIRE_DAYS * 86400}
    signing_input = "{}.{}".format(
        _b64url(json.dumps(header, separators=(",", ":")).encode()),
        _b64url(json.dumps(payload, separators=(",", ":")).encode()),
    )
    signature = hmac.new(SECRET_KEY.encode(), signing_input.encode(), hashlib.sha256).digest()
    return "{}.{}".format(signing_input, _b64url(signature))


def decode_token(token: str) -> dict:
    header_b64, payload_b64, sig_b64 = token.split(".")
    signing_input = f"{header_b64}.{payload_b64}"
    expected = hmac.new(SECRET_KEY.encode(), signing_input.encode(), hashlib.sha256).digest()
    if not hmac.compare_digest(_b64url_decode(sig_b64), expected):
        raise ValueError("bad signature")
    payload = json.loads(_b64url_decode(payload_b64))
    if int(payload.get("exp", 0)) < int(time.time()):
        raise ValueError("expired")
    return payload


# ---------- FastAPI dependency ----------
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    """Reads 'Authorization: Bearer <token>' and returns the matching user."""
    invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
    )
    try:
        payload = decode_token(credentials.credentials)
        user_id = int(payload["sub"])
    except Exception:
        raise invalid

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise invalid
    return user
