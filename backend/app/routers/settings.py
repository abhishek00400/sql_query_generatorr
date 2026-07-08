from __future__ import annotations

from fastapi import APIRouter

from app.config import AI_MODEL, GEMINI_API_KEY
from app.schemas.settings import AiStatusResponse, TestConnectionResponse, TestConnectionRequest
from app.services import db_service

router = APIRouter(prefix="/db", tags=["settings"])


@router.post("/test", response_model=TestConnectionResponse)
async def test_connection(request: TestConnectionRequest):
    result = db_service.test_connection(request.model_dump())
    return TestConnectionResponse(**result)


@router.get("/ai/status", response_model=AiStatusResponse)
async def ai_status():
    if not GEMINI_API_KEY:
        return AiStatusResponse(
            configured=False,
            model=AI_MODEL,
            status="missing_key",
            message="GEMINI_API_KEY is missing in backend/.env",
        )

    return AiStatusResponse(
        configured=True,
        model=AI_MODEL,
        status="configured",
        message="Gemini key and model are configured. Live generation is tested only when you generate SQL, to avoid wasting quota.",
    )