from fastapi import APIRouter, Depends, HTTPException, status
from app.logging_config import get_logger
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db


router = APIRouter(
    prefix="/api/trips",
    tags=["Trips"],
)

logger = get_logger("trips")

@router.get("", response_model=list[schemas.TripResponse])
def get_trips(db: Session = Depends(get_db)):
    trips = db.query(models.Trip).all()
    logger.info("Fetched %s trips", len(trips))
    return trips


@router.get("/{trip_id}", response_model=schemas.TripResponse)
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    logger.info("Looking up trip with ID: %s", trip_id)
    trip = (
        db.query(models.Trip)
        .filter(models.Trip.id == trip_id)
        .first()
    )

    if trip is None:
        logger.warning("Trip with ID %s not found", trip_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found",
        )

    logger.info("Trip with ID %s retrieved successfully", trip_id)
    return trip


@router.post(
    "",
    response_model=schemas.TripResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_trip(
    trip_data: schemas.TripCreate,
    db: Session = Depends(get_db),
):
    logger.info("Creating a new trip with name: %s", trip_data.name)
    trip = models.Trip(
        name=trip_data.name,
        travel_date=trip_data.travel_date,
    )
    try:
        db.add(trip)
        db.commit()
        db.refresh(trip)
        logger.info("Trip created with ID: %s", trip.id)
        return trip
    except Exception:
        logger.exception("Failed to create a new trip")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create trip",
        )


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(trip_id: int, db: Session = Depends(get_db)):
    logger.info("Deleting trip with ID: %s", trip_id)
    trip = (
        db.query(models.Trip)
        .filter(models.Trip.id == trip_id)
        .first()
    )

    if trip is None:
        logger.warning("Trip with ID %s not found for deletion", trip_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found",
        )

    try:
        db.delete(trip)
        db.commit()
        logger.info("Trip with ID %s deleted successfully", trip_id)
    except Exception:
        logger.exception("Failed to delete trip with ID: %s", trip_id)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete trip",
        )