"""GlobeTrotter backend — FastAPI app entry point.

Run from the backend/ folder:
    uvicorn app.main:app --reload
Then open http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, SessionLocal
from .seed import seed
from .routers import cities, users, trips, budget, public, friends, community


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


@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "docs": "/docs"}
