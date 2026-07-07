from __future__ import annotations

from fastapi import APIRouter

from app.config import AI_MODEL, GEMINI_API_KEY
from app.schemas.settings import AiStatusResponse, TestConnectionResponse, TestConnectionRequest
from app.services import ai_service, db_service

router = APIRouter(prefix="/db", tags=["settings"])


@router.post("/test", response_model=TestConnectionResponse)
async def test_connection(request: TestConnectionRequest):
    result = db_service.test_connection(request.model_dump())
    return TestConnectionResponse(**result)


@router.get("/ai/status", response_model=AiStatusResponse)
async def ai_status():
    if not GEMINI_API_KEY:
        return AiStatusResponse(configured=False, model=AI_MODEL, message="GEMINI_API_KEY is missing in backend/.env")

    try:
        ai_service._call_gemini("Return JSON only: {\"ok\": true}")
        return AiStatusResponse(configured=True, model=AI_MODEL, message="Gemini is connected and responding")
    except Exception as exc:
        return AiStatusResponse(configured=False, model=AI_MODEL, message=f"Gemini key/model is configured but the live call failed: {exc}")
