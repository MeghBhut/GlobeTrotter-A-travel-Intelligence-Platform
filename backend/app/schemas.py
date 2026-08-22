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


class UserPublicOut(BaseModel):
    """A safe, minimal view of another user (no email leak beyond what's needed)."""
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str


# ---------- trips ----------
class TripCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    daily_meal_estimate: Optional[int] = 0
    visibility: Optional[str] = "private"  # private | friends | public


class TripUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_public: Optional[bool] = None  # legacy; maps to visibility
    visibility: Optional[str] = None  # private | friends | public
    daily_meal_estimate: Optional[int] = None


class TripOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: Optional[str] = ""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_public: bool
    visibility: str
    status: str  # upcoming | ongoing | completed
    share_slug: Optional[str] = None
    cover_photo_url: Optional[str] = None
    daily_meal_estimate: int = 0
    destination_count: int
    owner: Optional[UserPublicOut] = None


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


class StopHotelCreate(BaseModel):
    hotel_id: int
    nights: Optional[int] = None  # defaults to the stop's night count if omitted


class StopHotelOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    hotel_id: int
    name: str
    tier: str
    price_per_night: int
    nights: int


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
    hotels: List[StopHotelOut] = []


# ---------- travel legs (city -> city) ----------
class TripLegCreate(BaseModel):
    from_city_id: int
    to_city_id: int
    mode: str = "flight"
    cost: int = 0
    depart_date: Optional[date] = None
    duration_hours: Optional[int] = None


class TripLegUpdate(BaseModel):
    from_city_id: Optional[int] = None
    to_city_id: Optional[int] = None
    mode: Optional[str] = None
    cost: Optional[int] = None
    depart_date: Optional[date] = None
    duration_hours: Optional[int] = None
    order_index: Optional[int] = None


class TripLegOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    from_city: CityOut
    to_city: CityOut
    mode: str
    cost: int
    depart_date: Optional[date] = None
    duration_hours: Optional[int] = None
    order_index: int


class TripDetailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: Optional[str] = ""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_public: bool
    visibility: str
    status: str  # upcoming | ongoing | completed
    share_slug: Optional[str] = None
    cover_photo_url: Optional[str] = None
    daily_meal_estimate: int = 0
    owner: Optional[UserPublicOut] = None
    stops: List[StopOut] = []
    legs: List[TripLegOut] = []


# ---------- friends & community ----------
class UserSearchOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: EmailStr


class FriendRequestCreate(BaseModel):
    user_id: int  # the user to send a friend request to


class FriendshipOut(BaseModel):
    """A friendship row as seen by the current user."""
    id: int
    user: UserPublicOut          # the OTHER person in the friendship
    status: str                  # pending | accepted
    direction: str               # incoming | outgoing (for pending requests)


class CloneResponse(BaseModel):
    id: int          # new trip id in my account
    name: str
    message: str = "Trip cloned to your account"


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
