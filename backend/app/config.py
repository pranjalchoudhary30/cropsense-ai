from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    MONGO_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "cropsense"
    WEATHER_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
