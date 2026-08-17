from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import require_user_id
from app.database import get_db


router = APIRouter(
    prefix="/api/trips",
    tags=["Trips"],
)


@router.get("", response_model=list[schemas.TripResponse])
def get_trips(
    user_id: str = Depends(require_user_id),
    db: Session = Depends(get_db),
):
    return db.query(models.Trip).filter(models.Trip.owner_id == user_id).all()


@router.get("/{trip_id}", response_model=schemas.TripResponse)
def get_trip(
    trip_id: int,
    user_id: str = Depends(require_user_id),
    db: Session = Depends(get_db),
):
    trip = (
        db.query(models.Trip)
        .filter(models.Trip.id == trip_id, models.Trip.owner_id == user_id)
        .first()
    )

    if trip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found",
        )

    return trip


@router.post(
    "",
    response_model=schemas.TripResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_trip(
    trip_data: schemas.TripCreate,
    user_id: str = Depends(require_user_id),
    db: Session = Depends(get_db),
):
    trip = models.Trip(
        owner_id=user_id,
        name=trip_data.name,
        travel_date=trip_data.travel_date,
        destinations=[stop.model_dump() for stop in trip_data.destinations],
    )

    db.add(trip)
    db.commit()
    db.refresh(trip)

    return trip


@router.patch("/{trip_id}", response_model=schemas.TripResponse)
def update_trip(
    trip_id: int,
    trip_data: schemas.TripUpdate,
    user_id: str = Depends(require_user_id),
    db: Session = Depends(get_db),
):
    trip = (
        db.query(models.Trip)
        .filter(models.Trip.id == trip_id, models.Trip.owner_id == user_id)
        .first()
    )
    if trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    for field, value in trip_data.model_dump(exclude_unset=True).items():
        setattr(trip, field, value)

    db.commit()
    db.refresh(trip)
    return trip


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(
    trip_id: int,
    user_id: str = Depends(require_user_id),
    db: Session = Depends(get_db),
):
    trip = (
        db.query(models.Trip)
        .filter(models.Trip.id == trip_id, models.Trip.owner_id == user_id)
        .first()
    )

    if trip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found",
        )

    db.delete(trip)
    db.commit()
