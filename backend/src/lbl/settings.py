"""Environment-driven configuration. Every variable is listed in `backend/.env.example`."""

from __future__ import annotations

from enum import StrEnum
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class AppEnv(StrEnum):
    LOCAL = "local"
    TEST = "test"
    STAGING = "staging"
    PRODUCTION = "production"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: AppEnv = AppEnv.LOCAL
    log_level: str = "INFO"
    # Used from M0-05 onwards. Never logged.
    database_url: str | None = None

    @property
    def log_json(self) -> bool:
        """JSON logs everywhere except local development."""
        return self.app_env is not AppEnv.LOCAL


@lru_cache
def get_settings() -> Settings:
    return Settings()
