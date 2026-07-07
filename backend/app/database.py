from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import APP_DB_URL

FALLBACK_DB_URL = "sqlite:///./querymind.db"

engine = create_engine(APP_DB_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db() -> None:
    from app.models.history import QueryHistory  # noqa: F401

    global engine, SessionLocal
    try:
        Base.metadata.create_all(bind=engine)
    except SQLAlchemyError as exc:
        print(f"History database unavailable ({exc}). Falling back to local SQLite.")
        engine = create_engine(FALLBACK_DB_URL, pool_pre_ping=True)
        SessionLocal.configure(bind=engine)
        Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

