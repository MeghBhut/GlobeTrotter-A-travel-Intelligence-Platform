"""GlobeTrotter backend — FastAPI app entry point.

Run from the backend/ folder:
    uvicorn app.main:app --reload
Then open http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, SessionLocal
from .seed import seed
from .routers import cities, users, trips, budget, public

# Create tables and load the seed catalog on startup.
Base.metadata.create_all(bind=engine)
_db = SessionLocal()
try:
    seed(_db)
finally:
    _db.close()

app = FastAPI(
    title="GlobeTrotter API",
    version="1.0.0",
    description="Backend for the GlobeTrotter travel planning prototype.",
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


@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "docs": "/docs"}
