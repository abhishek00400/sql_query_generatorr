from __future__ import annotations

import re
from fastapi import HTTPException

import pymysql
import psycopg2
from psycopg2.extras import RealDictCursor


SUPPORTED_TYPES = {"mysql", "postgresql"}


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
    try:
        cursor = conn.cursor()
        normalized = sql.strip().upper()
        if normalized.startswith("SELECT"):
            cursor.execute(sql)
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description] if cursor.description else []
            return {"columns": columns, "rows": rows, "rowCount": len(rows)}

        cursor.execute(sql)
        conn.commit()
        rowcount = cursor.rowcount
        return {"columns": [], "rows": [], "rowCount": rowcount}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    finally:
        try:
            cursor.close()
        except Exception:
            pass
        try:
            conn.close()
        except Exception:
            pass
