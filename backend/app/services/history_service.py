from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.history import QueryHistory


def save_entry(db: Session, data: dict) -> QueryHistory:
    entry = QueryHistory(
        user_input=data["user_input"],
        sql=data["sql"],
        query_type=data["query_type"],
        schema_used=data["schema_used"],
        estimated_rows=data["estimated_rows"],
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_all_entries(db: Session) -> list[QueryHistory]:
    return db.query(QueryHistory).order_by(QueryHistory.created_at.desc()).all()


def delete_entry(db: Session, entry_id: int) -> bool:
    entry = db.query(QueryHistory).filter(QueryHistory.id == entry_id).first()
    if not entry:
        return False
    db.delete(entry)
    db.commit()
    return True


def clear_all(db: Session) -> int:
    deleted = db.query(QueryHistory).delete()
    db.commit()
    return deleted
