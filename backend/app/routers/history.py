from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.history import HistoryResponse, HistoryEntry, SaveHistoryRequest
from app.database import get_db
from app.services import history_service

router = APIRouter(prefix="/history", tags=["history"])


@router.get("/", response_model=HistoryResponse)
async def get_history(db: Session = Depends(get_db)):
    entries = history_service.get_all_entries(db)
    return HistoryResponse(entries=entries)


@router.post("/", response_model=HistoryEntry)
async def save_history(request: SaveHistoryRequest, db: Session = Depends(get_db)):
    entry = history_service.save_entry(db, request.model_dump())
    return HistoryEntry.model_validate(entry)


@router.delete("/{entry_id}")
async def delete_history(entry_id: int, db: Session = Depends(get_db)):
    deleted = history_service.delete_entry(db, entry_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"success": True, "message": "Entry deleted"}


@router.delete("/")
async def clear_history(db: Session = Depends(get_db)):
    deleted_count = history_service.clear_all(db)
    return {"success": True, "deleted": deleted_count}
