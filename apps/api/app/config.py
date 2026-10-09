import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    app_name: str = "upbhokta-setu-api"
    app_version: str = "0.1.0"
    api_prefix: str = "/api/v1"
    port: int = 8000

    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    gemini_api_key: str = ""

    cors_origins: str = "http://localhost:8081,http://localhost:19000,http://localhost:19006"

    log_level: str = "info"
    ai_request_timeout_seconds: float = 30.0
    gemini_model: str = "gemini-3.8-flash"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
