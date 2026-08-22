"""Shared helpers for friendship checks and trip visibility."""
from sqlalchemy import or_, and_
from sqlalchemy.orm import Session

from . import models


def are_friends(db: Session, a_id: int, b_id: int) -> bool:
    if a_id == b_id:
        return True
    f = (
        db.query(models.Friendship)
        .filter(
            models.Friendship.status == "accepted",
            or_(
                and_(models.Friendship.requester_id == a_id,
                     models.Friendship.addressee_id == b_id),
                and_(models.Friendship.requester_id == b_id,
                     models.Friendship.addressee_id == a_id),
            ),
        )
        .first()
    )
    return f is not None


def can_view_trip(db: Session, trip: models.Trip, viewer_id: int) -> bool:
    """Owner sees always; friends see friends+public; others see public only."""
    if trip.user_id == viewer_id:
        return True
    if trip.visibility == "public":
        return True
    if trip.visibility == "friends" and are_friends(db, trip.user_id, viewer_id):
        return True
    return False


def apply_visibility(trip: models.Trip, visibility: str) -> None:
    """Set visibility and keep the legacy is_public flag in sync; mint a slug
    the first time a trip becomes shareable (public)."""
    import secrets

    if visibility not in ("private", "friends", "public"):
        visibility = "private"
    trip.visibility = visibility
    trip.is_public = visibility == "public"
    if visibility == "public" and not trip.share_slug:
        trip.share_slug = secrets.token_urlsafe(8)
