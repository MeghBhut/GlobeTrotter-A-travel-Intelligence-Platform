"""Trip CRUD + stops + stop-activities (all scoped to the logged-in user)."""
import secrets
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/api", tags=["trips"])


# ---------- helpers ----------
def _owned_trip(trip_id: int, user: models.User, db: Session) -> models.Trip:
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if trip is None or trip.user_id != user.id:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


def _owned_stop(stop_id: int, user: models.User, db: Session) -> models.TripStop:
    stop = db.query(models.TripStop).filter(models.TripStop.id == stop_id).first()
    if stop is None or stop.trip.user_id != user.id:
        raise HTTPException(status_code=404, detail="Stop not found")
    return stop


# ---------- trips ----------
@router.get("/trips", response_model=List[schemas.TripOut])
def list_trips(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(models.Trip)
        .filter(models.Trip.user_id == user.id)
        .order_by(models.Trip.created_at.desc())
        .all()
    )


@router.post("/trips", response_model=schemas.TripOut, status_code=201)
def create_trip(
    payload: schemas.TripCreate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = models.Trip(
        user_id=user.id,
        name=payload.name,
        description=payload.description or "",
        start_date=payload.start_date,
        end_date=payload.end_date,
        daily_meal_estimate=payload.daily_meal_estimate or 0,
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


@router.get("/trips/{trip_id}", response_model=schemas.TripDetailOut)
def get_trip(
    trip_id: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _owned_trip(trip_id, user, db)


@router.put("/trips/{trip_id}", response_model=schemas.TripOut)
def update_trip(
    trip_id: int,
    payload: schemas.TripUpdate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = _owned_trip(trip_id, user, db)
    data = payload.model_dump(exclude_unset=True)

    # Making a trip public mints a share slug once.
    if data.get("is_public") and not trip.share_slug:
        trip.share_slug = secrets.token_urlsafe(8)

    for field, value in data.items():
        setattr(trip, field, value)

    db.commit()
    db.refresh(trip)
    return trip


@router.delete("/trips/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(
    trip_id: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = _owned_trip(trip_id, user, db)
    db.delete(trip)
    db.commit()


# ---------- stops ----------
@router.post("/trips/{trip_id}/stops", response_model=schemas.StopOut, status_code=201)
def add_stop(
    trip_id: int,
    payload: schemas.StopCreate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = _owned_trip(trip_id, user, db)
    if db.query(models.City).get(payload.city_id) is None:
        raise HTTPException(status_code=400, detail="City not found")

    next_order = len(trip.stops)
    stop = models.TripStop(
        trip_id=trip.id,
        city_id=payload.city_id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        order_index=next_order,
    )
    db.add(stop)
    db.commit()
    db.refresh(stop)
    return stop


@router.put("/stops/{stop_id}", response_model=schemas.StopOut)
def update_stop(
    stop_id: int,
    payload: schemas.StopUpdate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stop = _owned_stop(stop_id, user, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(stop, field, value)
    db.commit()
    db.refresh(stop)
    return stop


@router.delete("/stops/{stop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stop(
    stop_id: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stop = _owned_stop(stop_id, user, db)
    db.delete(stop)
    db.commit()


# ---------- activities inside a stop ----------
@router.post(
    "/stops/{stop_id}/activities",
    response_model=schemas.StopActivityOut,
    status_code=201,
)
def add_stop_activity(
    stop_id: int,
    payload: schemas.StopActivityCreate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stop = _owned_stop(stop_id, user, db)
    activity = db.query(models.Activity).get(payload.activity_id)
    if activity is None:
        raise HTTPException(status_code=400, detail="Activity not found")

    line = models.StopActivity(
        stop_id=stop.id,
        activity_id=payload.activity_id,
        num_people=payload.num_people,
    )
    db.add(line)
    db.commit()
    db.refresh(line)
    return line


@router.delete("/stop-activities/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stop_activity(
    item_id: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    line = db.query(models.StopActivity).filter(models.StopActivity.id == item_id).first()
    if line is None or line.stop.trip.user_id != user.id:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(line)
    db.commit()


# ---------- hotels inside a stop ----------
@router.post(
    "/stops/{stop_id}/hotels",
    response_model=schemas.StopHotelOut,
    status_code=201,
)
def add_stop_hotel(
    stop_id: int,
    payload: schemas.StopHotelCreate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stop = _owned_stop(stop_id, user, db)
    hotel = db.query(models.Hotel).get(payload.hotel_id)
    if hotel is None:
        raise HTTPException(status_code=400, detail="Hotel not found")

    # Default nights to the stop's date span if the client didn't specify.
    nights = payload.nights if payload.nights is not None else max(stop.nights, 1)
    line = models.StopHotel(stop_id=stop.id, hotel_id=payload.hotel_id, nights=nights)
    db.add(line)
    db.commit()
    db.refresh(line)
    return line


@router.delete("/stop-hotels/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stop_hotel(
    item_id: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    line = db.query(models.StopHotel).filter(models.StopHotel.id == item_id).first()
    if line is None or line.stop.trip.user_id != user.id:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(line)
    db.commit()


# ---------- travel legs (city -> city) ----------
def _owned_leg(leg_id: int, user: models.User, db: Session) -> models.TripLeg:
    leg = db.query(models.TripLeg).filter(models.TripLeg.id == leg_id).first()
    if leg is None or leg.trip.user_id != user.id:
        raise HTTPException(status_code=404, detail="Leg not found")
    return leg


@router.post("/trips/{trip_id}/legs", response_model=schemas.TripLegOut, status_code=201)
def add_leg(
    trip_id: int,
    payload: schemas.TripLegCreate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = _owned_trip(trip_id, user, db)
    for cid in (payload.from_city_id, payload.to_city_id):
        if db.query(models.City).get(cid) is None:
            raise HTTPException(status_code=400, detail=f"City {cid} not found")

    leg = models.TripLeg(
        trip_id=trip.id,
        from_city_id=payload.from_city_id,
        to_city_id=payload.to_city_id,
        mode=payload.mode,
        cost=payload.cost,
        depart_date=payload.depart_date,
        duration_hours=payload.duration_hours,
        order_index=len(trip.legs),
    )
    db.add(leg)
    db.commit()
    db.refresh(leg)
    return leg


@router.put("/legs/{leg_id}", response_model=schemas.TripLegOut)
def update_leg(
    leg_id: int,
    payload: schemas.TripLegUpdate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    leg = _owned_leg(leg_id, user, db)
    data = payload.model_dump(exclude_unset=True)
    for cid_field in ("from_city_id", "to_city_id"):
        if cid_field in data and db.query(models.City).get(data[cid_field]) is None:
            raise HTTPException(status_code=400, detail=f"City not found for {cid_field}")
    for field, value in data.items():
        setattr(leg, field, value)
    db.commit()
    db.refresh(leg)
    return leg


@router.delete("/legs/{leg_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_leg(
    leg_id: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    leg = _owned_leg(leg_id, user, db)
    db.delete(leg)
    db.commit()
