"""Automatic travel fare + duration estimation between two cities.

Uses the great-circle (Haversine) distance between city coordinates, then a
simple per-mode model for effective speed and per-km fare. Fares are per person
and multiplied by the number of travellers (car is per-vehicle).
"""
import math
from typing import Optional

from . import models

# effective km/h (includes overhead), fixed overhead hours, base fare, per-km fare
MODE_MODEL = {
    "flight": {"speed": 650, "overhead": 2.0, "base": 1500, "per_km": 6.5, "per_person": True},
    "train":  {"speed": 65,  "overhead": 0.5, "base": 150,  "per_km": 1.2, "per_person": True},
    "bus":    {"speed": 50,  "overhead": 0.3, "base": 100,  "per_km": 0.9, "per_person": True},
    "car":    {"speed": 55,  "overhead": 0.0, "base": 0,    "per_km": 9.0, "per_person": False},
    "ferry":  {"speed": 40,  "overhead": 0.5, "base": 150,  "per_km": 2.0, "per_person": True},
}
DEFAULT_MODE = "flight"


def haversine_km(lat1, lon1, lat2, lon2) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlmb = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
    return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def estimate(from_city: models.City, to_city: models.City,
             mode: str = DEFAULT_MODE, travelers: int = 1) -> dict:
    m = MODE_MODEL.get(mode, MODE_MODEL[DEFAULT_MODE])
    travelers = max(1, int(travelers or 1))

    if None in (from_city.latitude, from_city.longitude,
                to_city.latitude, to_city.longitude):
        distance = 0.0
    else:
        distance = haversine_km(from_city.latitude, from_city.longitude,
                                to_city.latitude, to_city.longitude)

    hours = round(distance / m["speed"] + m["overhead"]) if distance else 0
    fare_per_person = round(m["base"] + m["per_km"] * distance)
    if m["per_person"]:
        total = fare_per_person * travelers
    else:  # car: one vehicle regardless of travellers
        total = fare_per_person

    return {
        "from_city_id": from_city.id,
        "to_city_id": to_city.id,
        "mode": mode if mode in MODE_MODEL else DEFAULT_MODE,
        "travelers": travelers,
        "distance_km": round(distance),
        "duration_hours": hours,
        "fare_per_person": fare_per_person,
        "total_fare": total,
    }
