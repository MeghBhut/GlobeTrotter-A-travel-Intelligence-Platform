"""Budget computation for a trip (v1: activities only; hotels/transport/meals = 0)."""
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/api", tags=["budget"])


def compute_budget(trip: models.Trip) -> dict:
    activities_total = 0
    per_day: dict = {}  # date -> amount

    for stop in trip.stops:
        stop_cost = sum(a.price_per_person * a.num_people for a in stop.activities)
        activities_total += stop_cost

        # Spread this stop's cost evenly across the days it covers.
        if stop.start_date and stop.end_date and stop.end_date >= stop.start_date:
            days = (stop.end_date - stop.start_date).days + 1
            share = stop_cost // days
            remainder = stop_cost - share * days
            d = stop.start_date
            for i in range(days):
                amount = share + (remainder if i == 0 else 0)
                per_day[d] = per_day.get(d, 0) + amount
                d = d + timedelta(days=1)

    per_day_list = [
        {"date": d, "amount": amt} for d, amt in sorted(per_day.items())
    ]

    # Average over the trip's own date span when known, else over active days.
    if trip.start_date and trip.end_date and trip.end_date >= trip.start_date:
        trip_days = (trip.end_date - trip.start_date).days + 1
    else:
        trip_days = max(len(per_day_list), 1)
    average = activities_total // trip_days if trip_days else 0

    return {
        "trip_id": trip.id,
        "currency": "INR",
        "total": activities_total,
        "breakdown": {
            "activities": activities_total,
            "hotels": 0,
            "transport": 0,
            "meals": 0,
        },
        "per_day": per_day_list,
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
