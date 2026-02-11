"""Workout and WorkoutPlan models."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, JSON
from app.database import Base


class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    difficulty = Column(String(50), nullable=True)  # beginner, intermediate, advanced
    duration_minutes = Column(Integer, nullable=True)
    plan_data = Column(JSON, nullable=True)  # { daily_workouts: [...], weekly_summary, tips }
    created_at = Column(DateTime, default=datetime.utcnow)


class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("workout_plans.id"), nullable=True)
    name = Column(String(255), nullable=False)
    exercises = Column(JSON, nullable=True)  # list of {name, sets, reps, video_id, ...}
    completed_at = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
