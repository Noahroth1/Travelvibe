from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Loads environment variables; create a `.env` file in `backend/` for local dev."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str | None = None

    def __init__(self, **values):
        super().__init__(**values)
        if not self.database_url:
            self.database_url = "sqlite:///./travelvibe.db"


settings = Settings()
