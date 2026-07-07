from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.query import GenerateRequest, GenerateResponse, ExecuteRequest, ExecuteResponse
from app.database import get_db
from app.services import ai_service, history_service, schema_service, db_service
from app.services.schema_service import SAMPLE_SCHEMAS

router = APIRouter(prefix="/query", tags=["query"])


@router.post("/generate", response_model=GenerateResponse)
async def generate_sql(request: GenerateRequest, db: Session = Depends(get_db)):
    if not request.input or not request.input.strip():
        raise HTTPException(status_code=400, detail="Input is required")

    schema_sql = None
    if request.dbConfig:
        try:
            tables = schema_service.get_schema_from_db(request.dbConfig.model_dump())
            schema_sql = schema_service.schema_to_sql_string(tables)
        except Exception:
            schema_sql = None

    if not schema_sql and request.schema in SAMPLE_SCHEMAS:
        schema_sql = SAMPLE_SCHEMAS[request.schema]
    elif not schema_sql and isinstance(request.schema, str) and request.schema.strip().upper().startswith("CREATE"):
        schema_sql = request.schema
    elif not schema_sql and request.schema == "custom" and request.dbConfig:
        tables = schema_service.get_schema_from_db(request.dbConfig.model_dump())
        schema_sql = schema_service.schema_to_sql_string(tables)
    elif not schema_sql:
        raise HTTPException(status_code=400, detail="Unsupported schema selection")

    options = ai_service.generate_sql_options(request.input, schema_sql)
    if not options:
        raise HTTPException(status_code=500, detail="AI did not return any query options")

    first_option = options[0]
    schema_used = "custom" if request.schema.strip().upper().startswith("CREATE") else request.schema[:50]
    try:
        history_service.save_entry(
            db,
            {
                "user_input": request.input,
                "sql": first_option["sql"],
                "query_type": first_option["impact"]["type"],
                "schema_used": schema_used,
                "estimated_rows": first_option["impact"]["estimatedRows"],
            },
        )
    except Exception:
        pass

    return GenerateResponse(options=options)


@router.post("/execute", response_model=ExecuteResponse)
async def execute_query(request: ExecuteRequest):
    sql = request.sql.strip()
    if not sql:
        raise HTTPException(status_code=400, detail="SQL is required")

    normalized = sql.upper()
    if "DROP DATABASE" in normalized or ("TRUNCATE" in normalized and "WHERE" not in normalized):
        raise HTTPException(status_code=400, detail="This operation is too dangerous to execute via this tool")

    result = db_service.execute_query(sql, request.dbConfig.model_dump())
    return ExecuteResponse(columns=result["columns"], rows=result["rows"], rowCount=result["rowCount"])
