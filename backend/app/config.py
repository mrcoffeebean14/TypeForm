"""Application configuration loaded from environment variables."""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # SQLite database URL. In production (Render) point this at a persistent disk.
    database_url: str = "sqlite:///./app.db"

    # Comma-separated list of allowed CORS origins for the frontend.
    cors_origins: str = "http://localhost:3000"

    # Base URL of the public respondent app, used when composing share links.
    public_base_url: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
