"""Loads the seed catalog into the DB once (skips if cities already exist).

ID convention (matches API_CONTRACT.md):
  activity.id = city_id * 100  + index(1..10)   -> Mumbai: 101..110
  hotel.id    = city_id * 1000 + index(1..10)   -> Mumbai: 1001..1010
"""
from sqlalchemy.orm import Session

from . import models
from .seed_data import SEED_CITIES

# Approximate lat/lng for each seed city (id -> (lat, lng)) for distance/fare math.
CITY_COORDS = {
    1: (19.0760, 72.8777),   # Mumbai
    2: (28.6139, 77.2090),   # New Delhi
    3: (26.9124, 75.7873),   # Jaipur
    4: (12.9716, 77.5946),   # Bengaluru
    5: (25.3176, 82.9739),   # Varanasi
    6: (24.5854, 73.7125),   # Udaipur
    7: (22.5726, 88.3639),   # Kolkata
    8: (9.9312, 76.2673),    # Kochi
    9: (17.3850, 78.4867),   # Hyderabad
    10: (15.4909, 73.8278),  # Goa (Panaji)
}


def seed(db: Session) -> None:
    if db.query(models.City).first() is not None:
        return  # already seeded

    for city in SEED_CITIES:
        lat, lng = CITY_COORDS.get(city["id"], (None, None))
        db.add(models.City(
            id=city["id"], name=city["name"],
            state=city["state"], country="India",
            latitude=lat, longitude=lng,
        ))
        for i, (name, price) in enumerate(city["activities"], start=1):
            db.add(models.Activity(
                id=city["id"] * 100 + i, city_id=city["id"],
                name=name, price_per_person=price,
            ))
        for i, (name, tier, price) in enumerate(city["hotels"], start=1):
            db.add(models.Hotel(
                id=city["id"] * 1000 + i, city_id=city["id"],
                name=name, tier=tier, price_per_night=price,
            ))

    db.commit()
