import bcrypt
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.config import settings

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Pull from settings (loaded from .env)
SECRET_KEY = settings.SECRET_KEY
GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID


class AuthService:
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )

    def get_password_hash(self, password: str) -> str:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    def verify_google_token(self, token: str) -> dict:
        """Verify a Google ID token and return the user payload."""
        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                GOOGLE_CLIENT_ID,
            )
            return idinfo
        except ValueError as e:
            raise ValueError(f"Invalid Google token: {e}")
