"""Community: browse everyone's public trips (no friendship required)."""
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/api", tags=["community"])


@router.get("/community/trips", response_model=List[schemas.TripOut])
def community_trips(
    limit: int = 30,
    offset: int = 0,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """All public trips, newest first — each carries its `owner`. Clone one with
    POST /api/trips/{id}/clone."""
    limit = max(1, min(limit, 100))
    return (
        db.query(models.Trip)
        .filter(models.Trip.visibility == "public")
        .order_by(models.Trip.created_at.desc())
        .offset(max(offset, 0))
        .limit(limit)
        .all()
    )
