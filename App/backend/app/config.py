from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = (BASE_DIR / "cdar_platform.db").as_posix()


class Settings(BaseSettings):
    PROJECT_NAME: str = "CDAR Artistes & Fans API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Sécurité & Auth
    SECRET_KEY: str = "super-secret-key-change-in-production-cdar-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    
    # Base de données (SQLite / PostgreSQL)
    DATABASE_URL: str = f"sqlite:///{DEFAULT_DB_PATH}"
    
    # Passerelle de paiement : mobile_money / wave / orange_money
    PAYMENT_PROVIDER: str = "mobile_money"
    
    # Commissions
    PLATFORM_COMMISSION_PERCENT: float = 20.0  # 20% plateforme
    ARTIST_SHARE_PERCENT: float = 80.0         # 80% artiste
    MIN_PAYOUT_AMOUNT: float = 5000.0          # 5 000 F CFA minimum pour retrait

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
