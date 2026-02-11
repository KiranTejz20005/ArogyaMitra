"""Progress tracking model."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, JSON
from app.database import Base


class ProgressEntry(Base):
    __tablename__ = "progress_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    entry_type = Column(String(50), nullable=False)  # weight, measurement, photo, etc.
    value = Column(Float, nullable=True)
    unit = Column(String(20), nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True)  # extra fields
    notes = Column(Text, nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
