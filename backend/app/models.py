# Describes database tables
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

from app.database import Base


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    travel_date = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Destination(Base):
    __tablename__ = "destinations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    region = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    image = Column(Text, nullable=False)
    detail = Column(Text, nullable=False)

    best_time = Column(String(100), nullable=True)
    visit_duration = Column(String(50), nullable=True)
    budget_level = Column(String(3), nullable=True)
    vibes = Column(JSONB, nullable=False, default=list)

    gallery = Column(JSONB, nullable=False, default=list)
    neighbourhoods = Column(JSONB, nullable=False, default=list)
