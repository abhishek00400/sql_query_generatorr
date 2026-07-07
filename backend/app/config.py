from __future__ import annotations

import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR.parent / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("Missing GEMINI_API_KEY in environment")

AI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
APP_DB_URL = os.getenv("APP_DB_URL", "sqlite:///./querymind.db")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
PORT = int(os.getenv("PORT", "5000"))
ENV = os.getenv("ENV", "development")

