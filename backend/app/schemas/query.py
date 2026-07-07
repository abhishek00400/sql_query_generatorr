from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field


class DbConfig(BaseModel):
    host: str
    port: str
    dbName: str
    username: str
    password: str
    type: str  # "mysql" or "postgresql"


class GenerateRequest(BaseModel):
    input: str
    schema: str
    dbConfig: DbConfig | None = None


class ValidationItem(BaseModel):
    status: str
    label: str
    detail: str | None = None


class ImpactInfo(BaseModel):
    type: str
    estimatedRows: int
    isDestructive: bool


class ColumnInfo(BaseModel):
    name: str
    role: str


class TableInfo(BaseModel):
    name: str
    columns: list[ColumnInfo]


class ExplanationInfo(BaseModel):
    bullets: list[str]


class QueryOption(BaseModel):
    sql: str
    explanation: ExplanationInfo
    tables: list[TableInfo]
    impact: ImpactInfo
    validation: list[ValidationItem]


class GenerateResponse(BaseModel):
    options: list[QueryOption]


class ExecuteRequest(BaseModel):
    sql: str
    dbConfig: DbConfig


class ExecuteResponse(BaseModel):
    columns: list[str]
    rows: list[dict]
    rowCount: int
