from __future__ import annotations

import httpx
import json
import re
from fastapi import HTTPException
import sqlparse

from app.config import GEMINI_API_KEY, AI_MODEL
from app.services.schema_service import SAMPLE_SCHEMAS

GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"


def _build_system_prompt() -> str:
    return (
        "You are an expert SQL query generator. Given a database schema and a natural language request, generate 2 different SQL query options.\n"
        "Rules:\n"
        "1. Always respond with valid JSON only — no markdown, no explanation outside JSON\n"
        "2. Generate exactly 2 query options when possible (1 if only one makes sense)\n"
        "3. Each option must include sql, explanation bullets, tables involved, impact estimate\n"
        "4. Explanation bullets must be in plain English, no jargon, max 5 bullets\n"
        "5. Estimate rows realistically based on the query type\n"
        "6. Detect if query is destructive (UPDATE/DELETE/DROP/TRUNCATE)\n"
        "7. Check for missing indexes on filtered columns\n"
        "Response format must be strict JSON with options list."
    )


def _build_user_prompt(user_input: str, schema_sql: str) -> str:
    return (
        f"Schema:\n{schema_sql}\n\n"
        f"User request: {user_input}\n"
    )


def _validate_option(option: dict) -> bool:
    required_keys = {"sql", "explanation", "tables", "impact", "validation"}
    if not required_keys.issubset(option.keys()):
        return False
    if not isinstance(option["sql"], str):
        return False
    if not isinstance(option["explanation"], dict) or not isinstance(option["explanation"].get("bullets"), list):
        return False
    if not isinstance(option["tables"], list):
        return False
    if not isinstance(option["impact"], dict):
        return False
    if not isinstance(option["validation"], list):
        return False
    return True


def validate_sql_syntax(sql: str) -> dict:
    try:
        parsed = sqlparse.parse(sql)
        if not parsed:
            return {"valid": False, "error": "Unable to parse SQL"}
        return {"valid": True, "error": None}
    except Exception as exc:
        return {"valid": False, "error": str(exc)}


def _normalize_generated_option(raw: dict) -> dict:
    sql = raw.get("sql", "").strip()
    impact = raw.get("impact", {})
    if isinstance(impact, dict):
        impact_type = impact.get("type", "SELECT")
        estimated = int(impact.get("estimatedRows", 0))
        destructive = bool(impact.get("isDestructive", False))
    else:
        impact_type = "SELECT"
        estimated = 0
        destructive = False

    return {
        "sql": sql,
        "explanation": {"bullets": raw.get("explanation", {}).get("bullets", [])},
        "tables": raw.get("tables", []),
        "impact": {"type": impact_type, "estimatedRows": estimated, "isDestructive": destructive},
        "validation": raw.get("validation", []),
    }


def _extract_json_block(text: str) -> str:
    text = text.strip()
    match = re.search(r"\{(?:.|\n)*\}", text)
    if match:
        return match.group(0)
    return text


def _build_fallback_sql(user_input: str, schema_sql: str) -> str:
    text = (user_input or "").strip().lower()
    table_match = re.search(r"create table\s+([\w`]+)", schema_sql, re.IGNORECASE)
    table_name = table_match.group(1).strip('`') if table_match else "table"

    if any(word in text for word in ["count", "how many", "total", "number of"]):
        return f"SELECT COUNT(*) AS total_count FROM `{table_name}`"

    if any(word in text for word in ["latest", "recent", "last"]):
        return f"SELECT * FROM `{table_name}` ORDER BY 1 DESC LIMIT 10"

    if any(word in text for word in ["top", "highest", "max", "best"]):
        return f"SELECT * FROM `{table_name}` LIMIT 10"

    return f"SELECT * FROM `{table_name}` LIMIT 50"


def _build_fallback_options(user_input: str, schema_sql: str) -> list[dict]:
    fallback_sql = _build_fallback_sql(user_input, schema_sql)
    return [{
        "sql": fallback_sql,
        "explanation": {"bullets": ["The app used a schema-based fallback query because the AI service did not return a usable response."]},
        "tables": [],
        "impact": {"type": "SELECT", "estimatedRows": 50, "isDestructive": False},
        "validation": [{"status": "warning", "label": "Fallback mode", "detail": "No live AI response available"}],
    }]


def _call_gemini(prompt: str) -> str:
    url = f"{GEMINI_BASE_URL}/models/{AI_MODEL}:generateContent"
    params = {"key": GEMINI_API_KEY}
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 1200,
            "topP": 0.95,
            "topK": 40,
        },
    }

    try:
        response = httpx.post(url, params=params, json=body, timeout=30)
        response.raise_for_status()
        payload = response.json()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI request failed: {exc}")

    if not isinstance(payload, dict):
        raise HTTPException(status_code=500, detail="Invalid AI response payload")

    candidates = payload.get("candidates") or []
    if not candidates or not isinstance(candidates, list):
        raise HTTPException(status_code=500, detail="AI response did not contain candidates")

    first_candidate = candidates[0]
    if not isinstance(first_candidate, dict):
        raise HTTPException(status_code=500, detail="AI response candidate missing content")

    parts = first_candidate.get("content", {}).get("parts") or []
    if not parts:
        raise HTTPException(status_code=500, detail="AI response candidate missing content")

    text_parts = [part.get("text", "") for part in parts if isinstance(part, dict)]
    return "".join(text_parts)


def generate_sql_options(user_input: str, schema_sql: str) -> list[dict]:
    if not schema_sql or not schema_sql.strip():
        raise HTTPException(status_code=400, detail="Schema SQL is required")

    try:
        prompt = _build_user_prompt(user_input, schema_sql)
        full_prompt = f"{_build_system_prompt()}\n\n{prompt}"
        raw_text = _call_gemini(full_prompt)
        json_text = _extract_json_block(raw_text)

        payload = json.loads(json_text)
    except Exception:
        return _build_fallback_options(user_input, schema_sql)

    if not isinstance(payload, dict) or "options" not in payload or not isinstance(payload["options"], list):
        return _build_fallback_options(user_input, schema_sql)

    options = []
    for raw_option in payload["options"]:
        if not _validate_option(raw_option):
            return _build_fallback_options(user_input, schema_sql)
        options.append(_normalize_generated_option(raw_option))

    if not options:
        return _build_fallback_options(user_input, schema_sql)

    return options
