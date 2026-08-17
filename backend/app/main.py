from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.cities import router as cities_router
from app.routes.destinations import router as destinations_router
from app.config import settings
from app.routes.trips import router as trips_router
from app.routes.user_state import router as user_state_router

app = FastAPI(title="Travel Vibe API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cities_router)
app.include_router(destinations_router)
app.include_router(trips_router)
app.include_router(user_state_router)




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
