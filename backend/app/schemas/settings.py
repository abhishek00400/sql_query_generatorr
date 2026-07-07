from __future__ import annotations

from pydantic import BaseModel


class TestConnectionRequest(BaseModel):
    host: str
    port: str
    dbName: str
    username: str
    password: str
    type: str


class TestConnectionResponse(BaseModel):
    success: bool
    message: str


class AiStatusResponse(BaseModel):
    configured: bool
    model: str
    message: str
