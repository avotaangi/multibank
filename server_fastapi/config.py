from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    # Database
    mongodb_uri: str = "mongodb://localhost:27017/multibank"
    
    # JWT
    jwt_secret: str = "your-super-secret-jwt-key-here"
    jwt_expires_in: str = "7d"
    
    # Server
    port: int = 3001
    environment: str = "development"
    
    # Telegram
    telegram_bot_token: str = ""
    telegram_webhook_url: str = ""
    
    # Security
    bcrypt_rounds: int = 12
    rate_limit_window_ms: int = 900000  # 15 minutes
    rate_limit_max_requests: int = 100
    
    # CORS
    allowed_origins: List[str] = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177,http://localhost:5178,http://localhost:5179,http://localhost:5180"
    ).split(",")
    
    # Open Banking API
    open_bankingapi_team_id: str = "team096"
    open_bankingapi_password: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

