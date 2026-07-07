from __future__ import annotations

from datetime import date, datetime, time
from decimal import Decimal
from fastapi import HTTPException

import pymysql
import psycopg2
from psycopg2.extras import RealDictCursor


SUPPORTED_TYPES = {"mysql", "postgresql"}


def _json_safe(value):
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (datetime, date, time)):
        return value.isoformat()
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")
    return value


def _normalize_rows(rows):
    normalized = []
    for row in rows:
        if isinstance(row, dict):
            normalized.append({key: _json_safe(value) for key, value in row.items()})
        else:
            normalized.append(row)
    return normalized


def get_connection(db_config: dict):
    db_type = db_config.get("type")
    if db_type == "mysql":
        try:
            return pymysql.connect(
                host=db_config["host"],
                port=int(db_config["port"]),
                database=db_config["dbName"],
                user=db_config["username"],
                password=db_config["password"],
                cursorclass=pymysql.cursors.DictCursor,
                connect_timeout=5,
            )
        except Exception as exc:
            raise HTTPException(status_code=503, detail=f"Cannot connect to database: {exc}")

    if db_type == "postgresql":
        try:
            return psycopg2.connect(
                host=db_config["host"],
                port=int(db_config["port"]),
                dbname=db_config["dbName"],
                user=db_config["username"],
                password=db_config["password"],
                connect_timeout=5,
                cursor_factory=RealDictCursor,
            )
        except Exception as exc:
            raise HTTPException(status_code=503, detail=f"Cannot connect to database: {exc}")

    raise HTTPException(status_code=400, detail="Unsupported database type")


def test_connection(db_config: dict) -> dict:
    try:
        conn = get_connection(db_config)
        with conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        return {"success": True, "message": f"Connected successfully to {db_config.get('dbName')}"}
    except HTTPException as exc:
        return {"success": False, "message": str(exc.detail)}
    except Exception as exc:
        return {"success": False, "message": f"Connection failed: {exc}"}


def execute_query(sql: str, db_config: dict) -> dict:
    conn = get_connection(db_config)
    cursor = None
    try:
        cursor = conn.cursor()
        normalized = sql.strip().upper()
        returns_rows = normalized.startswith("SELECT") or normalized.startswith("WITH") or normalized.startswith("SHOW") or normalized.startswith("DESCRIBE") or normalized.startswith("EXPLAIN")
        cursor.execute(sql)

        if returns_rows or cursor.description:
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description] if cursor.description else []
            safe_rows = _normalize_rows(rows)
            return {"columns": columns, "rows": safe_rows, "rowCount": len(safe_rows)}

        conn.commit()
        rowcount = cursor.rowcount
        return {"columns": [], "rows": [], "rowCount": rowcount}
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        raise HTTPException(status_code=400, detail=str(exc))
    finally:
        try:
            if cursor:
                cursor.close()
        except Exception:
            pass
        try:
            conn.close()
        except Exception:
            pass
