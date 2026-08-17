#Describes what JSON our API accepts and returns
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


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


class TripStop(BaseModel):
    destination: str = Field(min_length=1, max_length=100)
    days: int = Field(default=1, ge=1, le=60)
    neighbourhood: str | None = Field(default=None, max_length=100)


class TripCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    travel_date: str | None = Field(default=None, max_length=50)
    destinations: list[TripStop] = Field(default_factory=list)

    @field_validator("destinations", mode="before")
    @classmethod
    def upgrade_legacy_destinations(cls, value):
        if not isinstance(value, list):
            return value
        return [
            {"destination": item, "days": 1, "neighbourhood": None}
            if isinstance(item, str)
            else item
            for item in value
        ]


class TripUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    travel_date: str | None = Field(default=None, max_length=50)
    destinations: list[TripStop] | None = None

    @field_validator("destinations", mode="before")
    @classmethod
    def upgrade_legacy_destinations(cls, value):
        if value is None or not isinstance(value, list):
            return value
        return [
            {"destination": item, "days": 1, "neighbourhood": None}
            if isinstance(item, str)
            else item
            for item in value
        ]


class TripResponse(TripCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserStateUpdate(BaseModel):
    saved_order: list[str] = Field(default_factory=list)
    notes: dict[str, str] = Field(default_factory=dict)
    been_there: list[str] = Field(default_factory=list)
    recently_viewed: list[str] = Field(default_factory=list)
    dark_mode: bool = False
    layout_mode: Literal["grid", "list"] = "grid"


class UserStateResponse(UserStateUpdate):
    initialized: bool = True
