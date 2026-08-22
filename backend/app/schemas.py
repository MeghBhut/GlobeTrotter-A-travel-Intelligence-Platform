"""Pydantic schemas — the exact JSON shapes from API_CONTRACT.md."""
from datetime import date
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr


# ---------- reference data ----------
class CityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    state: str
    country: str


class ActivityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    city_id: int
    name: str
    price_per_person: int


class HotelOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    city_id: int
    name: str
    tier: str
    price_per_night: int


# ---------- auth ----------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: EmailStr


class TokenResponse(BaseModel):
    token: str
    user: UserOut


# ---------- trips ----------
class TripCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class TripUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_public: Optional[bool] = None


class TripOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: Optional[str] = ""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_public: bool
    share_slug: Optional[str] = None
    cover_photo_url: Optional[str] = None
    destination_count: int


# ---------- stops & stop-activities ----------
class StopActivityCreate(BaseModel):
    activity_id: int
    num_people: int = 1


class StopActivityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    activity_id: int
    name: str
    price_per_person: int
    num_people: int


class StopCreate(BaseModel):
    city_id: int
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class StopUpdate(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    order_index: Optional[int] = None


class StopOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    city: CityOut
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    order_index: int
    activities: List[StopActivityOut] = []


class TripDetailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: Optional[str] = ""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_public: bool
    share_slug: Optional[str] = None
    cover_photo_url: Optional[str] = None
    stops: List[StopOut] = []


# ---------- budget ----------
class BudgetBreakdown(BaseModel):
    activities: int
    hotels: int
    transport: int
    meals: int


class BudgetDay(BaseModel):
    date: date
    amount: int


class BudgetOut(BaseModel):
    trip_id: int
    currency: str = "INR"
    total: int
    breakdown: BudgetBreakdown
    per_day: List[BudgetDay] = []
    average_per_day: int
