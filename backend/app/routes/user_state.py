from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import require_user_id
from app.database import get_db


router = APIRouter(prefix="/api/me/state", tags=["Account state"])


def serialize_state(state: models.UserState) -> schemas.UserStateResponse:
    return schemas.UserStateResponse(
        saved_order=state.saved_order or [],
        notes=state.notes or {},
        been_there=state.been_there or [],
        recently_viewed=state.recently_viewed or [],
        dark_mode=bool(state.dark_mode),
        layout_mode=state.layout_mode,
        initialized=True,
    )


@router.get("", response_model=schemas.UserStateResponse)
def get_user_state(
    user_id: str = Depends(require_user_id),
    db: Session = Depends(get_db),
):
    state = db.query(models.UserState).filter(models.UserState.owner_id == user_id).first()
    if state is None:
        return schemas.UserStateResponse(initialized=False)
    return serialize_state(state)


@router.put("", response_model=schemas.UserStateResponse)
def put_user_state(
    state_data: schemas.UserStateUpdate,
    user_id: str = Depends(require_user_id),
    db: Session = Depends(get_db),
):
    state = db.query(models.UserState).filter(models.UserState.owner_id == user_id).first()
    if state is None:
        state = models.UserState(owner_id=user_id)
        db.add(state)

    for field, value in state_data.model_dump().items():
        setattr(state, field, int(value) if field == "dark_mode" else value)

    db.commit()
    db.refresh(state)
    return serialize_state(state)
