"""GlobeTrotter backend — FastAPI app entry point.

Run from the backend/ folder:
    uvicorn app.main:app --reload
Then open http://localhost:8000  (serves BOTH the app and the API — no separate
frontend server or IP config needed). API docs at http://localhost:8000/docs
"""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import Base, engine, SessionLocal
from .seed import seed, CITY_COORDS
from .routers import (
    cities, users, trips, budget, public, friends, community, calendar,
)

# The frontend (index.html, js/, css/) lives one level above backend/.
FRONTEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def _migrate() -> None:
    """Tiny additive migration: add columns that create_all() can't add to an
    already-existing table. Safe to run every startup."""
    with engine.begin() as conn:
        cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(trips)")]
        if "daily_meal_estimate" not in cols:
            conn.exec_driver_sql(
                "ALTER TABLE trips ADD COLUMN daily_meal_estimate INTEGER DEFAULT 0"
            )
        if "visibility" not in cols:
            conn.exec_driver_sql(
                "ALTER TABLE trips ADD COLUMN visibility VARCHAR DEFAULT 'private'"
            )
            # Backfill: existing public trips keep being public.
            conn.exec_driver_sql(
                "UPDATE trips SET visibility='public' WHERE is_public=1"
            )
        if "travelers" not in cols:
            conn.exec_driver_sql("ALTER TABLE trips ADD COLUMN travelers INTEGER DEFAULT 1")
        if "origin_city_id" not in cols:
            conn.exec_driver_sql("ALTER TABLE trips ADD COLUMN origin_city_id INTEGER")
        sa_cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(stop_activities)")]
        if "scheduled_date" not in sa_cols:
            conn.exec_driver_sql("ALTER TABLE stop_activities ADD COLUMN scheduled_date DATE")
        if "slot" not in sa_cols:
            conn.exec_driver_sql("ALTER TABLE stop_activities ADD COLUMN slot VARCHAR")
        # City coordinates (added for fare/distance) — add columns + backfill.
        c_cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(cities)")]
        if "latitude" not in c_cols:
            conn.exec_driver_sql("ALTER TABLE cities ADD COLUMN latitude FLOAT")
        if "longitude" not in c_cols:
            conn.exec_driver_sql("ALTER TABLE cities ADD COLUMN longitude FLOAT")
        for cid, (lat, lng) in CITY_COORDS.items():
            conn.exec_driver_sql(
                "UPDATE cities SET latitude=?, longitude=? "
                "WHERE id=? AND (latitude IS NULL OR longitude IS NULL)",
                (lat, lng, cid),
            )


# Create tables, run migrations, and load the seed catalog on startup.
Base.metadata.create_all(bind=engine)
_migrate()
_db = SessionLocal()
try:
    seed(_db)
finally:
    _db.close()

app = FastAPI(
    title="GlobeTrotter API",
    version="3.0.0",
    description="Backend for GlobeTrotter — trips, travel, budgets, friends & community.",
)

# Allow the frontend dev server to call us during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to the frontend origin before production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cities.router)
app.include_router(users.router)
app.include_router(trips.router)
app.include_router(budget.router)
app.include_router(public.router)
app.include_router(friends.router)
app.include_router(community.router)
app.include_router(calendar.router)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "docs": "/docs"}


# Serve the frontend from the SAME origin as the API (single server, no IP config).
# Mounted LAST so /api/*, /docs, /health match first; everything else (index.html,
# js/, css/) is served statically. Opening http://<host>:8000 loads the whole app.
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
