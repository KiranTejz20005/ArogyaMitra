"""Health assessment."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.health import HealthAssessment
from app.core.deps import get_current_user

router = APIRouter()


class HealthAssessmentCreate(BaseModel):
    age: int | None = None
    gender: str | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    bmi: float | None = None
    bmi_category: str | None = None
    health_conditions: list[str] | None = None
    injuries: list[str] | None = None
    sleep_hours: float | None = None
    stress_level: str | None = None
    activity_level: str | None = None
    fitness_goal: str | None = None
    fitness_level: str | None = None
    workout_preference: str | None = None
    workout_time_preference: str | None = None
    dietary_preference: str | None = None
    notes: str | None = None


@router.get("/")
def get_assessment(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    a = db.query(HealthAssessment).filter(HealthAssessment.user_id == current_user.id).order_by(HealthAssessment.updated_at.desc()).first()
    return a or {}


@router.post("/", response_model=dict)
def upsert_assessment(
    data: HealthAssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(HealthAssessment).filter(HealthAssessment.user_id == current_user.id).first()
    if existing:
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(existing, k, v)
        db.commit()
        db.refresh(existing)
        return {"id": existing.id, "updated": True}
    assessment = HealthAssessment(user_id=current_user.id, **data.model_dump())
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return {"id": assessment.id, "updated": False}
