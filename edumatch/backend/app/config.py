from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str             = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/pfe_db")
    SECRET_KEY: str               = os.getenv("SECRET_KEY", "changeme")
    ALGORITHM: str                = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    HF_API_KEY: str               = os.getenv("HF_API_KEY", "")

    class Config:
        env_file = ".env"
        extra = "ignore"   # ← ignore les variables .env inconnues

settings = Settings()