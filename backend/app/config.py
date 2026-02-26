from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    MONGO_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "cropsense"
    WEATHER_API_KEY: str = ""
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    SECRET_KEY: str = "cropsense-super-secret-jwt-key-2026"

    class Config:
        env_file = ".env"

settings = Settings()
