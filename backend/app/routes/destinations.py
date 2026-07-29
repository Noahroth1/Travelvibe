from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.logging_config import get_logger
from app.models import Destination
from app.schemas import DestinationResponse

router = APIRouter()
logger = get_logger("destinations")


@router.get("/api/destinations", response_model=list[DestinationResponse])
def get_destinations(db: Session = Depends(get_db)):
    try:
        destinations = db.query(Destination).order_by(Destination.id).all()
        logger.info("Fetched %s destinations", len(destinations))
        return destinations
    except Exception:
        logger.exception("Failed to fetch destinations from the database")
        raise
