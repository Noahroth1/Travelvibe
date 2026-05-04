from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings

app = FastAPI(title="Travel Vibe API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def api_health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health")
def health() -> dict[str, str]:
    """Simple health check without /api prefix (handy for containers)."""
    return {"status": "ok"}


@app.get("/api/config")
def api_config() -> dict[str, bool]:
    """Shows whether a database URL is configured (no secrets returned)."""
    return {"database_configured": settings.database_url is not None}
