"""Calendar view: a trip's activities grouped by real calendar date."""
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas, access
from ..auth import get_current_user

router = APIRouter(prefix="/api", tags=["calendar"])


@router.get("/trips/{trip_id}/calendar", response_model=schemas.CalendarOut)
def trip_calendar(
    trip_id: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if trip is None or not access.can_view_trip(db, trip, user.id):
        raise HTTPException(status_code=404, detail="Trip not found")

    # Work out the calendar span: trip dates, else the min/max of stop dates.
    starts = [s.start_date for s in trip.stops if s.start_date]
    ends = [s.end_date for s in trip.stops if s.end_date]
    start = trip.start_date or (min(starts) if starts else None)
    end = trip.end_date or (max(ends) if ends else None)

    # Each activity's effective date = its scheduled_date, else its stop's start.
    items_by_date: dict = {}
    for stop in trip.stops:
        for a in stop.activities:
            eff = a.scheduled_date or stop.start_date
            if eff is None:
                continue
            items_by_date.setdefault(eff, []).append({
                "stop_activity_id": a.id,
                "activity_id": a.activity_id,
                "name": a.name,
                "city": stop.city.name if stop.city else "",
                "slot": a.slot,
                "price_per_person": a.price_per_person,
                "num_people": a.num_people,
            })
            if eff < (start or eff):
                start = eff
            if eff > (end or eff):
                end = eff

    days = []
    if start and end and end >= start:
        d = start
        while d <= end:
            covering = next(
                (s for s in trip.stops
                 if s.start_date and s.end_date and s.start_date <= d <= s.end_date),
                None,
            )
            days.append({
                "date": d,
                "city": covering.city.name if covering and covering.city else None,
                "items": sorted(items_by_date.get(d, []), key=lambda i: (i["slot"] or "")),
            })
            d += timedelta(days=1)

    return {"trip_id": trip.id, "start_date": start, "end_date": end, "days": days}
