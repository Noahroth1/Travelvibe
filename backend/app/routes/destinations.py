from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Destination
from app.schemas import DestinationResponse

router = APIRouter()

@router.get("/api/destinations", response_model=list[DestinationResponse])
def get_destinations(db: Session = Depends(get_db)):
    return db.query(Destination).order_by(Destination.id).all()
