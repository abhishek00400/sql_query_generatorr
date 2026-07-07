from __future__ import annotations

from fastapi import APIRouter, HTTPException
from app.services import schema_service
from app.services.schema_service import SAMPLE_SCHEMAS

router = APIRouter(prefix="/schema", tags=["schema"])


@router.get("/sample/{key}")
async def get_sample_schema(key: str):
    schema = SAMPLE_SCHEMAS.get(key)
    if not schema:
        raise HTTPException(status_code=404, detail="Schema not found")

    parsed = schema_service.parse_raw_schema(schema)
    return {"sqlKey": key, "parsed": {"tables": parsed}, "sql": schema}
