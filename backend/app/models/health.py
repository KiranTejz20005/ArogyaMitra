"""Health assessment model."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, JSON
from app.database import Base


class HealthAssessment(Base):
    __tablename__ = "health_assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    bmi = Column(Float, nullable=True)
    bmi_category = Column(String(50), nullable=True)
    health_conditions = Column(JSON, nullable=True)  # list of strings
    injuries = Column(JSON, nullable=True)
    sleep_hours = Column(Float, nullable=True)
    stress_level = Column(String(50), nullable=True)
    activity_level = Column(String(50), nullable=True)
    fitness_goal = Column(String(100), nullable=True)
    fitness_level = Column(String(50), nullable=True)
    workout_preference = Column(String(50), nullable=True)
    workout_time_preference = Column(String(50), nullable=True)
    dietary_preference = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
