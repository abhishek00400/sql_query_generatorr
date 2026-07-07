from __future__ import annotations

from pydantic import BaseModel


class DbConfig(BaseModel):
    host: str
    port: str
    dbName: str
    username: str
    password: str
    type: str


class ParseSchemaRequest(BaseModel):
    sql: str | None = None
    dbConfig: DbConfig | None = None


class ColumnDef(BaseModel):
    name: str
    type: str
    constraints: list[str]


class TableDef(BaseModel):
    name: str
    columns: list[ColumnDef]
    rowCount: int


class ParseSchemaResponse(BaseModel):
    tables: list[TableDef]
