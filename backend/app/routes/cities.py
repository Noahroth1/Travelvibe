from fastapi import APIRouter
from app.logging_config import get_logger

import geonamescache

router = APIRouter()
logger = get_logger("cities")
gc = geonamescache.GeonamesCache()
cities = gc.get_cities()

@router.get("/api/cities")
def search_cities(search: str = ""):
    if not search.strip():
        logger.warning("Empty search string provided for city search")
        return []

    results = []

    for city in cities.values():
        if search.lower() in city["name"].lower():
            results.append({
                "name": city["name"],
                "country": city["countrycode"]
            })
    logger.info("Found %s cities matching search '%s'", len(results), search)
    return results[:20]