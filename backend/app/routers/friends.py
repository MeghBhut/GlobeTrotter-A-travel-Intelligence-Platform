"""Friends: search users, send/accept/decline requests, list friends, view a
friend's visible trips."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, and_
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas, access
from ..auth import get_current_user

router = APIRouter(prefix="/api", tags=["friends"])


def _friendship_out(f: models.Friendship, me_id: int) -> dict:
    other = f.addressee if f.requester_id == me_id else f.requester
    direction = "outgoing" if f.requester_id == me_id else "incoming"
    return {"id": f.id, "user": other, "status": f.status, "direction": direction}


@router.get("/users/search", response_model=List[schemas.UserSearchOut])
def search_users(
    q: str = "",
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.User).filter(models.User.id != user.id)
    if q:
        like = f"%{q}%"
        query = query.filter(or_(models.User.name.ilike(like),
                                 models.User.email.ilike(like)))
    return query.order_by(models.User.name).limit(20).all()


@router.get("/friends", response_model=List[schemas.FriendshipOut])
def list_friends(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(models.Friendship)
        .filter(
            models.Friendship.status == "accepted",
            or_(models.Friendship.requester_id == user.id,
                models.Friendship.addressee_id == user.id),
        )
        .all()
    )
    return [_friendship_out(f, user.id) for f in rows]


@router.get("/friends/requests", response_model=List[schemas.FriendshipOut])
def list_requests(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Incoming pending friend requests addressed to me."""
    rows = (
        db.query(models.Friendship)
        .filter(models.Friendship.status == "pending",
                models.Friendship.addressee_id == user.id)
        .all()
    )
    return [_friendship_out(f, user.id) for f in rows]


@router.post("/friends/request", response_model=schemas.FriendshipOut, status_code=201)
def send_request(
    payload: schemas.FriendRequestCreate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.user_id == user.id:
        raise HTTPException(status_code=400, detail="You can't friend yourself")
    if db.query(models.User).get(payload.user_id) is None:
        raise HTTPException(status_code=404, detail="User not found")

    existing = (
        db.query(models.Friendship)
        .filter(or_(
            and_(models.Friendship.requester_id == user.id,
                 models.Friendship.addressee_id == payload.user_id),
            and_(models.Friendship.requester_id == payload.user_id,
                 models.Friendship.addressee_id == user.id),
        ))
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="A friendship or request already exists")

    f = models.Friendship(requester_id=user.id, addressee_id=payload.user_id, status="pending")
    db.add(f)
    db.commit()
    db.refresh(f)
    return _friendship_out(f, user.id)


@router.post("/friends/{friendship_id}/accept", response_model=schemas.FriendshipOut)
def accept_request(
    friendship_id: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    f = db.query(models.Friendship).filter(models.Friendship.id == friendship_id).first()
    if f is None or f.addressee_id != user.id or f.status != "pending":
        raise HTTPException(status_code=404, detail="Pending request not found")
    f.status = "accepted"
    db.commit()
    db.refresh(f)
    return _friendship_out(f, user.id)


@router.delete("/friends/{friendship_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_friendship(
    friendship_id: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Decline a request, cancel one you sent, or unfriend — same endpoint."""
    f = db.query(models.Friendship).filter(models.Friendship.id == friendship_id).first()
    if f is None or user.id not in (f.requester_id, f.addressee_id):
        raise HTTPException(status_code=404, detail="Friendship not found")
    db.delete(f)
    db.commit()


@router.get("/users/{user_id}/trips", response_model=List[schemas.TripOut])
def user_trips(
    user_id: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """A user's trips that are visible to me (friends see friends+public; else public)."""
    if db.query(models.User).get(user_id) is None:
        raise HTTPException(status_code=404, detail="User not found")
    trips = (
        db.query(models.Trip)
        .filter(models.Trip.user_id == user_id)
        .order_by(models.Trip.start_date.is_(None), models.Trip.start_date.asc())
        .all()
    )
    return [t for t in trips if access.can_view_trip(db, t, user.id)]
