"""Workouts and workout plans."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Any

from app.database import get_db
from app.models.user import User
from app.models.workout import Workout, WorkoutPlan
from app.core.deps import get_current_user

router = APIRouter()


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
    return db.query(WorkoutPlan).filter(WorkoutPlan.user_id == current_user.id).all()


@router.post("/plans", response_model=dict)
def create_plan(
    data: WorkoutPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = WorkoutPlan(user_id=current_user.id, **data.model_dump())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return {"id": plan.id, "name": plan.name, "plan_data": getattr(plan, "plan_data", None)}


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
