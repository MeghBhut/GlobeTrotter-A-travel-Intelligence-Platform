"""SQLAlchemy setup — a single local SQLite file, no server needed."""
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# The .db file lives next to the backend/ folder.
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BACKEND_DIR, "globetrotter.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

# check_same_thread=False is required for SQLite with FastAPI's threaded server.
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency: hands a DB session to a request and closes it after."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
