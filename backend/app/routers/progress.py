"""Progress entries (weight, measurements, etc.)."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Any

from app.database import get_db
from app.models.user import User
from app.models.progress import ProgressEntry
from app.core.deps import get_current_user

router = APIRouter()


class ProgressCreate(BaseModel):
    entry_type: str
    value: float | None = None
    unit: str | None = None
    metadata: dict[str, Any] | None = None
    notes: str | None = None


@router.get("/")
def list_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(ProgressEntry).filter(ProgressEntry.user_id == current_user.id).order_by(ProgressEntry.recorded_at.desc()).all()


@router.post("/", response_model=dict)
def create_progress(
    data: ProgressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = ProgressEntry(
        user_id=current_user.id,
        entry_type=data.entry_type,
        value=data.value,
        unit=data.unit,
        metadata_=data.metadata,
        notes=data.notes,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"id": entry.id, "entry_type": entry.entry_type}


@router.get("/{entry_id}")
def get_progress(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    e = db.query(ProgressEntry).filter(ProgressEntry.id == entry_id, ProgressEntry.user_id == current_user.id).first()
    if not e:
        raise HTTPException(404, "Progress entry not found")
    return e
