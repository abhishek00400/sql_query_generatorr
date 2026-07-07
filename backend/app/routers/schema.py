from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas.schema import ParseSchemaResponse, ParseSchemaRequest
from app.services import schema_service

router = APIRouter(prefix="/schema", tags=["schema"])


@router.post("/parse", response_model=ParseSchemaResponse)
async def parse_schema(request: ParseSchemaRequest):
    try:
        if request.sql and request.sql.strip():
            parsed = schema_service.parse_raw_schema(request.sql)
            return ParseSchemaResponse(tables=parsed)

        if request.dbConfig:
            tables = schema_service.get_schema_from_db(request.dbConfig.model_dump())
            return ParseSchemaResponse(tables=tables)

        raise HTTPException(status_code=400, detail="Either sql or dbConfig must be provided")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))
