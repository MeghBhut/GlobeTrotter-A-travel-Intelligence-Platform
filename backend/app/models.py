"""Database tables (ORM models) and the relationships between them."""
from sqlalchemy import (
    Boolean, Column, Date, ForeignKey, Integer, String, Text, DateTime, func
)
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    trips = relationship("Trip", back_populates="user", cascade="all, delete-orphan")


class City(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    state = Column(String, nullable=False)
    country = Column(String, nullable=False, default="India")

    activities = relationship("Activity", back_populates="city")
    hotels = relationship("Hotel", back_populates="city")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    price_per_person = Column(Integer, nullable=False, default=0)

    city = relationship("City", back_populates="activities")


class Hotel(Base):
    __tablename__ = "hotels"

    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    tier = Column(String, nullable=False)
    price_per_night = Column(Integer, nullable=False, default=0)

    city = relationship("City", back_populates="hotels")


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    is_public = Column(Boolean, default=False)
    share_slug = Column(String, unique=True, nullable=True, index=True)
    cover_photo_url = Column(String, nullable=True)  # left null in v1 (no upload)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="trips")
    stops = relationship(
        "TripStop",
        back_populates="trip",
        cascade="all, delete-orphan",
        order_by="TripStop.order_index",
    )

    @property
    def destination_count(self) -> int:
        return len(self.stops)


class TripStop(Base):
    __tablename__ = "trip_stops"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False, index=True)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    order_index = Column(Integer, default=0)

    trip = relationship("Trip", back_populates="stops")
    city = relationship("City")
    activities = relationship(
        "StopActivity",
        back_populates="stop",
        cascade="all, delete-orphan",
        order_by="StopActivity.id",
    )


class StopActivity(Base):
    """A chosen activity attached to a stop (join row + how many people)."""
    __tablename__ = "stop_activities"

    id = Column(Integer, primary_key=True, index=True)
    stop_id = Column(Integer, ForeignKey("trip_stops.id"), nullable=False, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)
    num_people = Column(Integer, default=1)

    stop = relationship("TripStop", back_populates="activities")
    activity = relationship("Activity")

    @property
    def name(self) -> str:
        return self.activity.name

    @property
    def price_per_person(self) -> int:
        return self.activity.price_per_person
