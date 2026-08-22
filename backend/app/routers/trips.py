"""Trip CRUD + stops + stop-activities (all scoped to the logged-in user)."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas, access, travel
from ..auth import get_current_user

router = APIRouter(prefix="/api", tags=["trips"])


@router.get("/estimate/travel", response_model=schemas.TravelEstimateOut, tags=["travel"])
def estimate_travel(
    from_city_id: int,
    to_city_id: int,
    mode: str = "flight",
    travelers: int = 1,
    db: Session = Depends(get_db),
):
    """Estimate fare + duration between two cities (used to prefill a travel leg)."""
    from_city = db.query(models.City).get(from_city_id)
    to_city = db.query(models.City).get(to_city_id)
    if from_city is None or to_city is None:
        raise HTTPException(status_code=404, detail="City not found")
    return travel.estimate(from_city, to_city, mode, travelers)


def _clone_trip_for(source: models.Trip, new_owner_id: int, db: Session) -> models.Trip:
    """Deep-copy a trip (stops + activities + hotels + legs) into a user's account,
    reset to private with no share slug."""
    clone = models.Trip(
        user_id=new_owner_id,
        name=f"Copy of {source.name}",
        description=source.description or "",
        start_date=source.start_date,
        end_date=source.end_date,
        daily_meal_estimate=source.daily_meal_estimate or 0,
        visibility="private",
        is_public=False,
        share_slug=None,
    )
    db.add(clone)
    db.flush()  # get clone.id

    for stop in source.stops:
        new_stop = models.TripStop(
            trip_id=clone.id, city_id=stop.city_id,
            start_date=stop.start_date, end_date=stop.end_date,
            order_index=stop.order_index,
        )
        db.add(new_stop)
        db.flush()
        for a in stop.activities:
            db.add(models.StopActivity(
                stop_id=new_stop.id, activity_id=a.activity_id, num_people=a.num_people))
        for h in stop.hotels:
            db.add(models.StopHotel(
                stop_id=new_stop.id, hotel_id=h.hotel_id, nights=h.nights))

    for leg in source.legs:
        db.add(models.TripLeg(
            trip_id=clone.id, from_city_id=leg.from_city_id, to_city_id=leg.to_city_id,
            mode=leg.mode, cost=leg.cost, depart_date=leg.depart_date,
            duration_hours=leg.duration_hours, order_index=leg.order_index))

    db.commit()
    db.refresh(clone)
    return clone


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
def list_trips(
    status: Optional[str] = None,  # upcoming | ongoing | completed (timeline filter)
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trips = (
        db.query(models.Trip)
        .filter(models.Trip.user_id == user.id)
        .order_by(models.Trip.start_date.is_(None), models.Trip.start_date.asc())
        .all()
    )
    if status:
        trips = [t for t in trips if t.status == status]
    return trips


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
        travelers=payload.travelers or 1,
        origin_city_id=payload.origin_city_id,
    )
    access.apply_visibility(trip, payload.visibility or "private")
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

    # Visibility: prefer the explicit `visibility`, else map the legacy is_public flag.
    if "visibility" in data:
        access.apply_visibility(trip, data.pop("visibility"))
        data.pop("is_public", None)
    elif "is_public" in data:
        access.apply_visibility(trip, "public" if data.pop("is_public") else "private")

    for field, value in data.items():
        setattr(trip, field, value)

    db.commit()
    db.refresh(trip)
    return trip


@router.post("/trips/{trip_id}/clone", response_model=schemas.CloneResponse, status_code=201)
def clone_trip(
    trip_id: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Copy a trip you can see (yours, public, or a friend's friends-only) into your account."""
    source = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if source is None or not access.can_view_trip(db, source, user.id):
        raise HTTPException(status_code=404, detail="Trip not found")
    clone = _clone_trip_for(source, user.id, db)
    return {"id": clone.id, "name": clone.name}


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
        scheduled_date=payload.scheduled_date,
        slot=payload.slot,
    )
    db.add(line)
    db.commit()
    db.refresh(line)
    return line


@router.put("/stop-activities/{item_id}", response_model=schemas.StopActivityOut)
def update_stop_activity(
    item_id: int,
    payload: schemas.StopActivityUpdate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Reschedule an activity (its date / slot) or change the number of people."""
    line = db.query(models.StopActivity).filter(models.StopActivity.id == item_id).first()
    if line is None or line.stop.trip.user_id != user.id:
        raise HTTPException(status_code=404, detail="Item not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(line, field, value)
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
    from_city = db.query(models.City).get(payload.from_city_id)
    to_city = db.query(models.City).get(payload.to_city_id)
    if from_city is None or to_city is None:
        raise HTTPException(status_code=400, detail="City not found")

    # Auto-estimate fare and duration (from the trip's traveler count) when the
    # client doesn't supply them.
    est = travel.estimate(from_city, to_city, payload.mode, trip.travelers or 1)
    cost = payload.cost if payload.cost is not None else est["total_fare"]
    duration = payload.duration_hours if payload.duration_hours is not None else est["duration_hours"]

    leg = models.TripLeg(
        trip_id=trip.id,
        from_city_id=payload.from_city_id,
        to_city_id=payload.to_city_id,
        mode=payload.mode,
        cost=cost,
        depart_date=payload.depart_date,
        duration_hours=duration,
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
