from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.cities import router as cities_router
from app.routes.destinations import router as destinations_router
from app.config import settings
from app.routes.trips import router as trips_router

from app.database import Base, engine
from app import models
from app.logging_config import configure_logging

app = FastAPI(title="Travel Vibe API", version="0.1.0")

configure_logging()
Base.metadata.create_all(bind=engine)

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

app.include_router(cities_router)
app.include_router(destinations_router)
app.include_router(trips_router)




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
