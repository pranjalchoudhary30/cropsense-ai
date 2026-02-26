from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
from google.oauth2 import id_token
from google.auth.transport import requests

# In a real app, these should come from config / environment variables
SECRET_KEY = "your-super-secret-jwt-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days
GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com" # Placeholder

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def verify_password(self, plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password):
        return pwd_context.hash(password)

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    def verify_google_token(self, token: str) -> dict:
        """
        Verify the Google OAuth token and return user info.
        """
        try:
            # Note: During testing without a real Client ID, this will fail if the token isn't valid for the specified client ID.
            # You might need to disable verification for pure local testing without internet/proper IDs
            # But here is the correct production code.
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)

            # Or, if you use multiple client IDs (web, mobile):
            # if idinfo['aud'] not in [CLIENT_ID_1, CLIENT_ID_2]:
            #     raise ValueError('Could not verify audience.')

            return idinfo
        except ValueError as e:
            # Invalid token
            raise ValueError(f"Invalid Google token: {str(e)}")
