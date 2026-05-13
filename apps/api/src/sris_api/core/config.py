from functools import lru_cache

from pydantic import AnyUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "SRIS API"
    database_url: str = Field(default="postgresql+asyncpg://postgres:postgres@localhost:5432/postgres")
    supabase_jwt_secret: str = ""
    allowed_user_email: str = ""
    cron_secret: str = "change-me"
    api_cors_origins: str = "http://localhost:3000"
    disable_auth: bool = False

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.api_cors_origins.split(",") if origin.strip()]

    @property
    def public_base_url(self) -> AnyUrl | None:
        return None


@lru_cache
def get_settings() -> Settings:
    return Settings()
