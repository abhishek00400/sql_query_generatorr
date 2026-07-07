from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import FRONTEND_URL, PORT
from app.database import init_db
from app.routers import history, query, schema, settings, sample_schema
import uvicorn

app = FastAPI(title="QueryMind AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(query.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(schema.router, prefix="/api")
app.include_router(sample_schema.router, prefix="/api")
app.include_router(settings.router, prefix="/api")


@app.get("/")
def root():
    return {"status": "QueryMind AI backend running", "version": "1.0.0"}


@app.on_event("startup")
async def startup():
    init_db()


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)

