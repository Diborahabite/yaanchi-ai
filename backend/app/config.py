"""
app/config.py — Application settings via Pydantic BaseSettings.
Values are read from environment variables or a .env file.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # General
    APP_NAME: str = "Yanchi AI"
    VERSION: str = "1.0.0"
    DEBUG: bool = False

    # OpenAI (optional — used for enhanced answer generation)
    OPENAI_API_KEY: str = ""

    # Vector / embedding store
    VECTOR_DB_PATH: str = "./chroma_db"

    # Ghost-mode ephemeral session TTL (seconds)
    EPHEMERAL_SESSION_TTL_SECONDS: int = 300

    # CORS
    ALLOWED_ORIGINS: list[str] = ["*"]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return the cached application settings singleton."""
    return Settings()
