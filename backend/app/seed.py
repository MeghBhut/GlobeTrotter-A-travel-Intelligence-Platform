"""Loads the seed catalog into the DB once (skips if cities already exist).

ID convention (matches API_CONTRACT.md):
  activity.id = city_id * 100  + index(1..10)   -> Mumbai: 101..110
  hotel.id    = city_id * 1000 + index(1..10)   -> Mumbai: 1001..1010
"""
from sqlalchemy.orm import Session

from . import models
from .seed_data import SEED_CITIES


def seed(db: Session) -> None:
    if db.query(models.City).first() is not None:
        return  # already seeded

    for city in SEED_CITIES:
        db.add(models.City(
            id=city["id"], name=city["name"],
            state=city["state"], country="India",
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
