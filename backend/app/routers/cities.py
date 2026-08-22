"""Reference data: cities, their activities, and their hotels (from the seed)."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/api", tags=["reference data"])


@router.get("/cities", response_model=List[schemas.CityOut])
def list_cities(search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.City)
    if search:
        query = query.filter(models.City.name.ilike(f"%{search}%"))
    return query.order_by(models.City.id).all()


@router.get("/cities/{city_id}/activities", response_model=List[schemas.ActivityOut])
def city_activities(city_id: int, db: Session = Depends(get_db)):
    if db.query(models.City).get(city_id) is None:
        raise HTTPException(status_code=404, detail="City not found")
    return (
        db.query(models.Activity)
        .filter(models.Activity.city_id == city_id)
        .order_by(models.Activity.id)
        .all()
    )


@router.get("/cities/{city_id}/hotels", response_model=List[schemas.HotelOut])
def city_hotels(city_id: int, db: Session = Depends(get_db)):
    if db.query(models.City).get(city_id) is None:
        raise HTTPException(status_code=404, detail="City not found")
    return (
        db.query(models.Hotel)
        .filter(models.Hotel.city_id == city_id)
        .order_by(models.Hotel.price_per_night)
        .all()
    )
