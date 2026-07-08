from __future__ import annotations

import hashlib
import json
import re
from decimal import Decimal
from typing import Any

import httpx
import sqlparse
from fastapi import HTTPException

from app.config import AI_MODEL, GEMINI_API_KEY
import os
import time
from app.services.schema_service import parse_raw_schema

GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"

NUMERIC_HINTS = ["amount", "price", "salary", "total", "score", "marks", "cgpa", "quantity", "count", "age", "id"]
DATE_HINTS = ["date", "time", "created", "updated", "joined", "join"]
CACHE_TTL_SECONDS = 600
_GENERATION_CACHE: dict[str, tuple[float, list[dict]]] = {}


def _build_system_prompt() -> str:
    return """
You are a senior SQL engineer. Convert the user's plain-English request into accurate SQL for the provided schema.

Return JSON only. No markdown. No extra prose.

Rules:
- Generate 2 to 3 options when useful.
- Put the best, most optimized query first.
- Use only tables and columns that exist in the schema.
- Prefer sargable WHERE clauses, explicit JOIN conditions, and indexed/primary key columns when available.
- Respect the user's requested filters, numeric values, grouping, sorting, limits, and table names.
- If the user says "having salary 80000", interpret it as salary >= 80000 unless they explicitly ask equality.
- Use MySQL-compatible SQL unless the schema clearly indicates otherwise.
- Do not invent columns.
- Avoid SELECT * when the user asks for specific fields; SELECT * is acceptable for "show all" requests.
- For destructive SQL, set isDestructive true.
- The sql value must be a single JSON string. Escape quotes and do not include raw line breaks inside string values.
- Use exactly one status value per validation item: success, warning, or danger.
- Use exactly one type value per impact: SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, or TRUNCATE.

Required JSON shape:
{
  "options": [
    {
      "sql": "SELECT ...;",
      "explanation": {"bullets": ["Why this query matches the request", "Why it is optimized"]},
      "tables": [{"name": "table_name", "columns": [{"name": "column_name", "role": "Filter|Return|Join|Sort|Group"}]}],
      "impact": {"type": "SELECT", "estimatedRows": 50, "isDestructive": false},
      "validation": [{"status": "success", "label": "Recommended", "detail": "Best matching option"}]
    }
  ]
}
""".strip()


def _build_user_prompt(user_input: str, schema_sql: str) -> str:
    return f"Schema:\n{schema_sql}\n\nUser request:\n{user_input}\n"


def validate_sql_syntax(sql: str) -> dict:
    try:
        parsed = sqlparse.parse(sql)
        if not parsed:
            return {"valid": False, "error": "Unable to parse SQL"}
        return {"valid": True, "error": None}
    except Exception as exc:
        return {"valid": False, "error": str(exc)}


def _extract_json_block(text: str) -> str:
    text = (text or "").strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?", "", text, flags=re.IGNORECASE).strip()
        text = re.sub(r"```$", "", text).strip()

    object_start = text.find("{")
    array_start = text.find("[")
    starts = [idx for idx in [object_start, array_start] if idx >= 0]
    if not starts:
        return text
    start = min(starts)

    opening = text[start]
    closing = "}" if opening == "{" else "]"
    depth = 0
    in_string = False
    escape = False
    for idx in range(start, len(text)):
        char = text[idx]
        if in_string:
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == "\"":
                in_string = False
            continue
        if char == "\"":
            in_string = True
        elif char == opening:
            depth += 1
        elif char == closing:
            depth -= 1
            if depth == 0:
                return text[start:idx + 1]
    return text[start:]


def _json_loads_ai(text: str) -> dict:
    json_text = _extract_json_block(text)
    payload = json.loads(json_text)
    if isinstance(payload, list):
        return {"options": payload}
    if isinstance(payload, dict):
        return payload
    raise ValueError("AI JSON was not an object or list")


def _repair_ai_json(raw_text: str, parse_error: Exception) -> dict:
    repair_prompt = (
        "Convert the following malformed AI response into valid JSON only. "
        "Preserve all SQL and fields. Return exactly this shape: "
        "{\"options\":[{\"sql\":\"...\",\"explanation\":{\"bullets\":[\"...\"]},"
        "\"tables\":[{\"name\":\"...\",\"columns\":[{\"name\":\"...\",\"role\":\"Return\"}]}],"
        "\"impact\":{\"type\":\"SELECT\",\"estimatedRows\":50,\"isDestructive\":false},"
        "\"validation\":[{\"status\":\"success\",\"label\":\"Recommended\",\"detail\":\"...\"}]}]}\n\n"
        f"Parse error: {parse_error}\n\nMalformed response:\n{raw_text}"
    )
    repaired_text = _call_gemini(repair_prompt)
    return _json_loads_ai(repaired_text)


def _parse_schema_summary(schema_sql: str) -> list[dict]:
    parsed = parse_raw_schema(schema_sql)
    return [
        {
            "name": table.get("name", "table"),
            "columns": [column.get("name", "") for column in table.get("columns", []) if column.get("name")],
        }
        for table in parsed
    ]


def _quote(name: str) -> str:
    clean = str(name).strip("`")
    return f"`{clean}`"


def _singular(value: str) -> str:
    value = value.lower()
    return value[:-1] if value.endswith("s") else value



def _is_internal_table(name: str) -> bool:
    return name.lower() in {"query_history", "alembic_version"}

def _primary_key_guess(columns: list[str]) -> str | None:
    return next((c for c in columns if c.lower() in {"id", "emp_id", "employee_id"} or c.lower().endswith("_id")), columns[0] if columns else None)

def _duplicate_columns(columns: list[str], pk_col: str | None) -> list[str]:
    skip = {pk_col} if pk_col else set()
    return [c for c in columns if c not in skip]

def _choose_table(user_input: str, tables: list[dict]) -> dict:
    text = (user_input or "").lower()
    for table in tables:
        name = table["name"].lower()
        if name in text or _singular(name) in text:
            return table
    non_internal = [table for table in tables if not _is_internal_table(table.get("name", ""))]
    return (non_internal[0] if non_internal else tables[0]) if tables else {"name": "table", "columns": []}


def _mentioned_columns(text: str, columns: list[str]) -> list[str]:
    mentioned = []
    for column in columns:
        normalized = column.lower().replace("_", " ")
        if column.lower() in text or normalized in text:
            mentioned.append(column)
    return mentioned


def _best_numeric_column(text: str, columns: list[str]) -> str | None:
    mentioned = _mentioned_columns(text, columns)
    for column in mentioned:
        if any(hint in column.lower() for hint in NUMERIC_HINTS):
            return column
    return next((c for c in columns if any(hint in c.lower() for hint in NUMERIC_HINTS)), None)


def _best_date_column(columns: list[str]) -> str | None:
    return next((c for c in columns if any(hint in c.lower() for hint in DATE_HINTS)), None)


def _table_info(table_name: str, columns: list[str], roles: dict[str, str] | None = None) -> list[dict]:
    roles = roles or {}
    return [{
        "name": table_name,
        "columns": [{"name": c, "role": roles.get(c, "Return")} for c in columns[:8]],
    }]


def _option(sql: str, bullets: list[str], tables: list[dict], validation_label: str, estimated_rows: int = 50) -> dict:
    sql_type = sql.strip().split(None, 1)[0].upper() if sql.strip() else "SELECT"
    destructive = sql_type in {"UPDATE", "DELETE", "DROP", "TRUNCATE"}
    return {
        "sql": sql,
        "explanation": {"bullets": bullets},
        "tables": tables,
        "impact": {"type": sql_type, "estimatedRows": estimated_rows, "isDestructive": destructive},
        "validation": [{"status": "success" if validation_label == "Recommended" else "warning", "label": validation_label, "detail": bullets[0] if bullets else None}],
    }


def _build_fallback_options(user_input: str, schema_sql: str) -> list[dict]:
    text = (user_input or "").strip().lower()
    tables = _parse_schema_summary(schema_sql)
    table = _choose_table(user_input, tables)
    table_name = table["name"]
    columns = table.get("columns") or []
    if not columns:
        return [_option(f"SELECT * FROM {_quote(table_name)} LIMIT 50;", ["Generated from the selected table."], _table_info(table_name, []), "Schema fallback")]

    options: list[dict] = []
    mentioned = _mentioned_columns(text, columns)
    numeric_col = _best_numeric_column(text, columns)
    date_col = _best_date_column(columns)
    number_match = re.search(r"\b\d+(?:\.\d+)?\b", text)

    select_cols = "*" if any(word in text for word in ["all", "show", "list", "display", "employee", "employees", "records", "rows", "top", "latest", "recent", "lowest"]) and "only" not in text else ", ".join(_quote(c) for c in (mentioned or columns[:6]))

    if "duplicate" in text or "duplicates" in text:
        pk_col = _primary_key_guess(columns)
        dup_cols = _duplicate_columns(columns, pk_col)
        if dup_cols:
            partition_cols = ", ".join(_quote(c) for c in dup_cols)
            display_cols = ", ".join(_quote(c) for c in dup_cols)
            preview_sql = f"SELECT {display_cols}, COUNT(*) AS duplicate_count FROM {_quote(table_name)} GROUP BY {partition_cols} HAVING COUNT(*) > 1 ORDER BY duplicate_count DESC;"
            roles = {c: "Group" for c in dup_cols}
            options.append(_option(preview_sql, ["Preview duplicate groups before deleting anything.", "This is the safest first step for duplicate cleanup."], _table_info(table_name, columns, roles), "Preview duplicates"))
            if pk_col:
                delete_sql = f"DELETE FROM {_quote(table_name)} WHERE {_quote(pk_col)} IN (SELECT { _quote(pk_col) } FROM (SELECT { _quote(pk_col) }, ROW_NUMBER() OVER (PARTITION BY {partition_cols} ORDER BY { _quote(pk_col) }) AS rn FROM {_quote(table_name)}) ranked_duplicates WHERE rn > 1);"
                options.insert(0, _option(delete_sql, [f"Deletes duplicate {table_name} rows while keeping the lowest {pk_col} in each duplicate group.", "Uses ROW_NUMBER() so only repeated rows are removed."], _table_info(table_name, columns, {pk_col: "Filter", **roles}), "Recommended"))
            backup_sql = f"CREATE TABLE {_quote(table_name + '_deduped')} AS SELECT DISTINCT * FROM {_quote(table_name)};"
            options.append(_option(backup_sql, ["Creates a deduplicated copy instead of deleting immediately.", "Use this when you want to inspect the cleaned data first."], _table_info(table_name, columns), "Safer alternative"))
            return options[:3]

    if any(word in text for word in ["count", "how many", "total number", "number of"]) and " by " not in text and " per " not in text:
        sql = f"SELECT COUNT(*) AS total_count FROM {_quote(table_name)};"
        options.append(_option(sql, ["Counts rows from the requested table.", "Uses COUNT(*) so the database can compute the total efficiently."], _table_info(table_name, columns, {}), "Recommended", 1))

    if number_match and numeric_col:
        number = number_match.group(0)
        operator = "="
        if any(word in text for word in ["above", "over", "greater", "more", "at least", "minimum", "min", "having"]):
            operator = ">="
        elif any(word in text for word in ["below", "under", "less", "at most", "maximum", "max"]):
            operator = "<="
        roles = {numeric_col: "Filter"}
        sql = f"SELECT {select_cols} FROM {_quote(table_name)} WHERE {_quote(numeric_col)} {operator} {number} LIMIT 50;"
        options.append(_option(sql, [f"Filters {table_name} using {numeric_col} {operator} {number}.", "This best matches the numeric condition in the request."], _table_info(table_name, columns, roles), "Recommended"))

    group_col = next((c for c in columns if any(token in text for token in [f"by {c.lower()}", f"per {c.lower()}", f"by {c.lower().replace('_', ' ')}", f"per {c.lower().replace('_', ' ')}"])), None)
    wants_aggregate = any(word in text for word in ["count", "total", "sum", "average", "avg", "how many", "number of"])
    if group_col and wants_aggregate:
        aggregate = "COUNT(*)"
        alias = "total_count"
        if numeric_col and any(word in text for word in ["sum", "total"]):
            aggregate = f"SUM({_quote(numeric_col)})"
            alias = f"total_{numeric_col}"
        elif numeric_col and any(word in text for word in ["average", "avg"]):
            aggregate = f"AVG({_quote(numeric_col)})"
            alias = f"avg_{numeric_col}"
        sql = f"SELECT {_quote(group_col)}, {aggregate} AS {_quote(alias)} FROM {_quote(table_name)} GROUP BY {_quote(group_col)} ORDER BY {_quote(alias)} DESC;"
        options.insert(0, _option(sql, [f"Groups rows by {group_col} and calculates {alias}.", "Orders the largest result first for easier comparison."], _table_info(table_name, columns, {group_col: "Group", numeric_col or group_col: "Return"}), "Recommended"))

    if numeric_col and any(word in text for word in ["top", "highest", "max", "best", "most"]):
        sql = f"SELECT {select_cols} FROM {_quote(table_name)} ORDER BY {_quote(numeric_col)} DESC LIMIT 10;"
        options.append(_option(sql, [f"Returns the highest rows by {numeric_col}.", "Uses ORDER BY with LIMIT to keep the result focused."], _table_info(table_name, columns, {numeric_col: "Sort"}), "Recommended", 10))

    if numeric_col and any(word in text for word in ["lowest", "least", "minimum"]):
        sql = f"SELECT {select_cols} FROM {_quote(table_name)} ORDER BY {_quote(numeric_col)} ASC LIMIT 10;"
        options.append(_option(sql, [f"Returns the lowest rows by {numeric_col}.", "Uses ORDER BY with LIMIT to keep the result focused."], _table_info(table_name, columns, {numeric_col: "Sort"}), "Recommended", 10))

    if date_col and any(word in text for word in ["latest", "recent", "last", "newest"]):
        sql = f"SELECT {select_cols} FROM {_quote(table_name)} ORDER BY {_quote(date_col)} DESC LIMIT 10;"
        options.append(_option(sql, [f"Returns the most recent rows using {date_col}.", "Sorts descending and limits the result."], _table_info(table_name, columns, {date_col: "Sort"}), "Recommended", 10))

    if not options:
        sql = f"SELECT {select_cols} FROM {_quote(table_name)} LIMIT 50;"
        options.append(_option(sql, ["Returns rows from the requested table using the active schema.", "Add a filter, sort, count, or grouping phrase for a more specific query."], _table_info(table_name, columns), "Schema fallback"))

    if len(options) == 1 and options[0]["sql"].upper().startswith("SELECT"):
        cols = ", ".join(_quote(c) for c in columns[: min(4, len(columns))])
        alt_sql = f"SELECT {cols} FROM {_quote(table_name)} LIMIT 50;"
        if alt_sql != options[0]["sql"]:
            options.append(_option(alt_sql, ["A narrower version that returns selected columns instead of every column."], _table_info(table_name, columns[:4]), "Alternative"))

    return options[:3]


def _call_gemini(prompt: str) -> str:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY is missing in backend/.env")

    url = f"{GEMINI_BASE_URL}/models/{AI_MODEL}:generateContent"
    params = {"key": GEMINI_API_KEY}
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 1800,
            "topP": 0.9,
            "responseMimeType": "application/json",
        },
    }

    try:
        response = httpx.post(url, params=params, json=body, timeout=30)
        response.raise_for_status()
        payload = response.json()
    except httpx.HTTPStatusError as exc:
        status_code = exc.response.status_code if exc.response is not None else 500
        if status_code == 429:
            raise HTTPException(status_code=429, detail="Gemini quota/rate limit reached. Wait for quota reset, reduce refresh/regenerate calls, or use a Google key with available quota.")
        raise HTTPException(status_code=status_code, detail=f"AI request failed: {exc}")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI request failed: {exc}")

    candidates = payload.get("candidates") or []
    if not candidates:
        raise HTTPException(status_code=500, detail="AI response did not contain candidates")
    parts = candidates[0].get("content", {}).get("parts") or []
    text_parts = [part.get("text", "") for part in parts if isinstance(part, dict)]
    return "".join(text_parts)


def _normalize_tables(raw_tables: Any) -> list[dict]:
    normalized = []
    if not isinstance(raw_tables, list):
        return normalized
    for table in raw_tables:
        if isinstance(table, str):
            normalized.append({"name": table, "columns": []})
            continue
        if not isinstance(table, dict):
            continue
        columns = []
        for column in table.get("columns", []) or []:
            if isinstance(column, str):
                columns.append({"name": column, "role": "Return"})
            elif isinstance(column, dict) and column.get("name"):
                columns.append({"name": str(column.get("name")), "role": str(column.get("role") or "Return")})
        normalized.append({"name": str(table.get("name") or table.get("table") or "table"), "columns": columns})
    return normalized


def _normalize_generated_option(raw: dict, idx: int) -> dict | None:
    if not isinstance(raw, dict):
        return None
    sql = str(raw.get("sql") or raw.get("query") or "").strip()
    if not sql:
        return None

    explanation = raw.get("explanation") or {}
    if isinstance(explanation, list):
        bullets = [str(item) for item in explanation]
    elif isinstance(explanation, str):
        bullets = [explanation]
    elif isinstance(explanation, dict):
        bullets = [str(item) for item in explanation.get("bullets", [])]
    else:
        bullets = []
    if not bullets:
        bullets = ["Generated by Gemini from the connected schema and user request."]

    impact = raw.get("impact") if isinstance(raw.get("impact"), dict) else {}
    sql_type = str(impact.get("type") or sql.split(None, 1)[0]).upper()
    estimated = impact.get("estimatedRows", impact.get("estimated_rows", 50))
    try:
        estimated_rows = int(estimated)
    except Exception:
        estimated_rows = 50

    validation = raw.get("validation") if isinstance(raw.get("validation"), list) else []
    normalized_validation = []
    for item in validation:
        if isinstance(item, dict):
            normalized_validation.append({
                "status": str(item.get("status") or "success"),
                "label": str(item.get("label") or ("Recommended" if idx == 0 else "Generated")),
                "detail": item.get("detail"),
            })
    if idx == 0 and not any(v.get("label") == "Recommended" for v in normalized_validation):
        normalized_validation.insert(0, {"status": "success", "label": "Recommended", "detail": "Best matching optimized option"})

    return {
        "sql": sql,
        "explanation": {"bullets": bullets[:5]},
        "tables": _normalize_tables(raw.get("tables", [])),
        "impact": {"type": sql_type, "estimatedRows": estimated_rows, "isDestructive": bool(impact.get("isDestructive", sql_type in {"UPDATE", "DELETE", "DROP", "TRUNCATE"}))},
        "validation": normalized_validation,
    }


def generate_sql_options(user_input: str, schema_sql: str) -> list[dict]:
    if not schema_sql or not schema_sql.strip():
        raise HTTPException(status_code=400, detail="Schema SQL is required")

    cache_key = hashlib.sha256(f"{AI_MODEL}\n{user_input}\n{schema_sql}".encode("utf-8")).hexdigest()
    cached = _GENERATION_CACHE.get(cache_key)
    if cached and time.time() - cached[0] < CACHE_TTL_SECONDS:
        return cached[1]
    try:
        full_prompt = f"{_build_system_prompt()}\n\n{_build_user_prompt(user_input, schema_sql)}"
        raw_text = _call_gemini(full_prompt)
        payload = json.loads(_extract_json_block(raw_text))
        raw_options = payload.get("options") if isinstance(payload, dict) else None
        if not isinstance(raw_options, list):
            raise ValueError("AI JSON missing options list")

        options = []
        for idx, raw_option in enumerate(raw_options[:3]):
            normalized = _normalize_generated_option(raw_option, idx)
            if normalized:
                options.append(normalized)

        if not options:
            raise ValueError("AI returned options but none contained SQL")
        _GENERATION_CACHE[cache_key] = (time.time(), options)
        return options
    except HTTPException:
        raise
    except Exception as exc:
        if os.getenv("ENABLE_SCHEMA_FALLBACK", "false").lower() == "true":
            fallback_options = _build_fallback_options(user_input, schema_sql)
            for option in fallback_options:
                option["validation"].insert(0, {
                    "status": "warning",
                    "label": "Fallback, not AI",
                    "detail": f"Gemini did not return usable SQL: {exc}",
                })
            return fallback_options
        raise HTTPException(
            status_code=502,
            detail=f"Gemini did not return usable SQL. Please check GEMINI_API_KEY/model or retry. Details: {exc}",
        )
