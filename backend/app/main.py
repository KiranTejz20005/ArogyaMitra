"""
ArogyaMitra - FastAPI backend entry point.
"""
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import (
    auth,
    workouts,
    nutrition,
    progress,
    health,
    aromi,
    calendar,
    admin,
)

load_dotenv()

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: init DB. Shutdown: cleanup if needed."""
    init_db()
    yield
    # Shutdown cleanup if any


app = FastAPI(
    title="ArogyaMitra API",
    description="AI-powered fitness and wellness platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modular routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(workouts.router, prefix="/workouts", tags=["workouts"])
app.include_router(nutrition.router, prefix="/nutrition", tags=["nutrition"])
app.include_router(progress.router, prefix="/progress", tags=["progress"])
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(aromi.router, prefix="/aromi", tags=["ai-coach"])
app.include_router(calendar.router, prefix="/calendar", tags=["calendar"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])


@app.get("/")
def root():
    return {"app": "ArogyaMitra", "status": "ok", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
