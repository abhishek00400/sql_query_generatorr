from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel


class HistoryEntry(BaseModel):
    id: int
    user_input: str
    sql: str
    query_type: str
    schema_used: str
    estimated_rows: int
    created_at: datetime

    class Config:
        orm_mode = True


class SaveHistoryRequest(BaseModel):
    user_input: str
    sql: str
    query_type: str
    schema_used: str
    estimated_rows: int


class HistoryResponse(BaseModel):
    entries: list[HistoryEntry]
