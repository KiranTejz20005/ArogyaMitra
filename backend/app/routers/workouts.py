"""Workouts and workout plans."""
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Any

from app.database import get_db
from app.models.user import User
from app.models.workout import Workout, WorkoutPlan
from app.models.progress import ProgressEntry
from app.core.deps import get_current_user

router = APIRouter()


def _normalize_plan_data(plan: WorkoutPlan) -> dict | None:
    raw = getattr(plan, "plan_data", None)
    if raw is None:
        return None
    if isinstance(raw, dict):
        return raw
    if isinstance(raw, str):
        try:
            return json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            return None
    return None


class WorkoutPlanCreate(BaseModel):
    name: str
    description: str | None = None
    difficulty: str | None = None
    duration_minutes: int | None = None
    plan_data: dict | None = None  # { daily_workouts, weekly_summary, tips }


class WorkoutCreate(BaseModel):
    plan_id: int | None = None
    name: str
    exercises: list[dict[str, Any]] | None = None
    duration_minutes: int | None = None
    notes: str | None = None


@router.get("/plans")
def list_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plans = db.query(WorkoutPlan).filter(WorkoutPlan.user_id == current_user.id).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "description": getattr(p, "description", None),
            "difficulty": getattr(p, "difficulty", None),
            "duration_minutes": getattr(p, "duration_minutes", None),
            "plan_data": _normalize_plan_data(p),
            "created_at": getattr(p, "created_at", None),
        }
        for p in plans
    ]


@router.post("/plans", response_model=dict)
def create_plan(
    data: WorkoutPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payload = data.model_dump()
    plan_data = payload.get("plan_data")
    if isinstance(plan_data, str):
        try:
            payload["plan_data"] = json.loads(plan_data)
        except (json.JSONDecodeError, TypeError):
            payload["plan_data"] = None
    plan = WorkoutPlan(user_id=current_user.id, **payload)
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return {"id": plan.id, "name": plan.name, "plan_data": _normalize_plan_data(plan)}


@router.get("/")
def list_workouts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Workout).filter(Workout.user_id == current_user.id).all()


@router.post("/", response_model=dict)
def create_workout(
    data: WorkoutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workout = Workout(user_id=current_user.id, **data.model_dump())
    db.add(workout)
    db.commit()
    db.refresh(workout)
    return {"id": workout.id, "name": workout.name}


class WorkoutCompleteBody(BaseModel):
    exercise_name: str
    plan_id: int | str | None = None
    sets_completed: int = 0
    reps_completed: int = 0
    duration_minutes: int = 0
    calories_burned: int = 0


@router.post("/complete", response_model=dict)
def complete_exercise(
    data: WorkoutCompleteBody,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Record exercise completion for email/JWT users (stored in progress_entries)."""
    entry = ProgressEntry(
        user_id=current_user.id,
        entry_type="workout_exercise",
        value=float(data.sets_completed),
        unit="sets",
        metadata_={
            "exercise_name": data.exercise_name,
            "plan_id": data.plan_id,
            "reps_completed": data.reps_completed,
            "duration_minutes": data.duration_minutes,
            "calories_burned": data.calories_burned,
        },
        notes=None,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"success": True, "id": entry.id}


@router.get("/{workout_id}")
def get_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    w = db.query(Workout).filter(Workout.id == workout_id, Workout.user_id == current_user.id).first()
    if not w:
        raise HTTPException(404, "Workout not found")
    return w
