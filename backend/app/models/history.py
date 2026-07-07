from __future__ import annotations

from datetime import datetime

from sqlalchemy import Integer, String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class QueryHistory(Base):
    __tablename__ = "query_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_input: Mapped[str] = mapped_column(String(500), nullable=False)
    sql: Mapped[str] = mapped_column(Text, nullable=False)

    query_type: Mapped[str] = mapped_column(String(20), nullable=False)
    schema_used: Mapped[str] = mapped_column(String(50), nullable=False)
    estimated_rows: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

