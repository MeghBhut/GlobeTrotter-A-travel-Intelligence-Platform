"""Public, read-only itinerary by share slug (no auth)."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/api", tags=["public"])


@router.get("/public/{slug}", response_model=schemas.TripDetailOut)
def public_trip(slug: str, db: Session = Depends(get_db)):
    trip = (
        db.query(models.Trip)
        .filter(models.Trip.share_slug == slug, models.Trip.is_public.is_(True))
        .first()
    )
    if trip is None:
        raise HTTPException(status_code=404, detail="Public trip not found")
    return trip
