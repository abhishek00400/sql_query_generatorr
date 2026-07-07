from __future__ import annotations

from fastapi import APIRouter

from app.schemas.settings import TestConnectionResponse, TestConnectionRequest
from app.services import db_service

router = APIRouter(prefix="/db", tags=["settings"])


@router.post("/test", response_model=TestConnectionResponse)
async def test_connection(request: TestConnectionRequest):
    result = db_service.test_connection(request.model_dump())
    return TestConnectionResponse(**result)
