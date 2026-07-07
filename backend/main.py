import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.config import FRONTEND_URL, PORT
from app.database import init_db
from app.routers.history import router as history_router
from app.routers.query import router as query_router
from app.routers.schema import router as schema_router
from app.routers.settings import router as settings_router
from app.routers.sample_schema import router as sample_schema_router
import uvicorn

app = FastAPI(title="QueryMind AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(query_router, prefix="/api")
app.include_router(history_router, prefix="/api")
app.include_router(schema_router, prefix="/api")
app.include_router(sample_schema_router, prefix="/api")
app.include_router(settings_router, prefix="/api")


@app.get("/")
def root():
    return {"status": "QueryMind AI backend running", "version": "1.0.0"}


@app.on_event("startup")
async def startup():
    init_db()


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)

