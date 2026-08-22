"""Full budget computation for a trip.

Total = activities + hotels + transport + meals.
  activities : per stop, sum(price_per_person * num_people)
  hotels     : per stop, sum(price_per_night * nights)
  transport  : sum of all travel-leg costs
  meals      : trip.daily_meal_estimate * number_of_trip_days
per_day spreads each cost onto the relevant dates so charts have a daily series.
"""
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/api", tags=["budget"])


def _add_day(per_day: dict, d, amount: int) -> None:
    if d is not None and amount:
        per_day[d] = per_day.get(d, 0) + amount


def _spread(per_day: dict, start, end, total: int) -> None:
    """Spread `total` evenly across the days in [start, end] (remainder on day 1)."""
    if not (start and end and end >= start) or not total:
        if start:
            _add_day(per_day, start, total)
        return
    days = (end - start).days + 1
    share, remainder = divmod(total, days)
    d = start
    for i in range(days):
        _add_day(per_day, d, share + (remainder if i == 0 else 0))
        d += timedelta(days=1)


def compute_budget(trip: models.Trip) -> dict:
    activities_total = 0
    hotels_total = 0
    transport_total = 0
    per_day: dict = {}

    for stop in trip.stops:
        stop_activities = sum(a.price_per_person * a.num_people for a in stop.activities)
        stop_hotels = sum(h.price_per_night * h.nights for h in stop.hotels)
        activities_total += stop_activities
        hotels_total += stop_hotels
        _spread(per_day, stop.start_date, stop.end_date, stop_activities)
        _spread(per_day, stop.start_date, stop.end_date, stop_hotels)

    for leg in trip.legs:
        transport_total += leg.cost or 0
        _add_day(per_day, leg.depart_date, leg.cost or 0)

    # Meals: a flat per-day estimate across the trip's date span.
    if trip.start_date and trip.end_date and trip.end_date >= trip.start_date:
        trip_days = (trip.end_date - trip.start_date).days + 1
    else:
        trip_days = max(len({d for d in per_day}), 1)
    meals_total = (trip.daily_meal_estimate or 0) * trip_days
    if trip.start_date and trip.end_date and trip.end_date >= trip.start_date:
        d = trip.start_date
        while d <= trip.end_date:
            _add_day(per_day, d, trip.daily_meal_estimate or 0)
            d += timedelta(days=1)

    total = activities_total + hotels_total + transport_total + meals_total
    average = total // trip_days if trip_days else 0

    return {
        "trip_id": trip.id,
        "currency": "INR",
        "total": total,
        "breakdown": {
            "activities": activities_total,
            "hotels": hotels_total,
            "transport": transport_total,
            "meals": meals_total,
        },
        "per_day": [{"date": d, "amount": amt} for d, amt in sorted(per_day.items())],
        "average_per_day": average,
    }


@router.get("/trips/{trip_id}/budget", response_model=schemas.BudgetOut)
def trip_budget(
    trip_id: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if trip is None or trip.user_id != user.id:
        raise HTTPException(status_code=404, detail="Trip not found")
    return compute_budget(trip)
