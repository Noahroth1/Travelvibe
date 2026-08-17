from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Loads environment variables; create a `.env` file in `backend/` for local dev."""

    model_config = SettingsConfigDict(
        env_file=(".env", ".env.clerk"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str | None = None
    clerk_secret_key: str | None = None
    clerk_jwt_key: str | None = None
    clerk_authorized_parties: str = "http://localhost:5173,http://127.0.0.1:5173"
    frontend_url: str | None = None

    @property
    def frontend_origin_list(self) -> list[str]:
        origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
        if self.frontend_url:
            origins.append(self.frontend_url.rstrip("/"))
        return origins

    @property
    def clerk_authorized_party_list(self) -> list[str]:
        parties = [party.strip().rstrip("/") for party in self.clerk_authorized_parties.split(",") if party.strip()]
        return list(dict.fromkeys([*parties, *self.frontend_origin_list]))


settings = Settings()
