#Describes what JSON our API accepts and returns
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class NeighbourhoodResponse(BaseModel):
    name: str
    vibe: str
    tips: list[str] = Field(default_factory=list)


class DestinationResponse(BaseModel):
    id: int
    name: str
    country: str
    region: Literal["Europe", "Asia", "Americas", "Middle East", "Oceania", "Africa"]
    description: str
    image: str
    detail: str
    best_time: str | None = None
    visit_duration: str | None = None
    budget_level: Literal["$", "$$", "$$$"] | None = None
    vibes: list[Literal["Beach", "City Break", "Culture", "Adventure", "Food"]] = Field(default_factory=list)
    gallery: list[str] = Field(default_factory=list)
    neighbourhoods: list[NeighbourhoodResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class TripCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    travel_date: str | None = Field(default=None, max_length=50)


class TripResponse(TripCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
