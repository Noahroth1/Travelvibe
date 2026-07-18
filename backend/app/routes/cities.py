from fastapi import APIRouter
import geonamescache

router = APIRouter()

gc = geonamescache.GeonamesCache()
cities = gc.get_cities()

@router.get("/api/cities")
def search_cities(search: str = ""):
    if not search.strip():
        return []

    results = []

    for city in cities.values():
        if search.lower() in city["name"].lower():
            results.append({
                "name": city["name"],
                "country": city["countrycode"]
            })

    return results[:20]