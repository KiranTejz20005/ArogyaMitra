"""Admin-only routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.core.deps import get_current_user

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(403, "Admin only")
    return current_user


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return db.query(User).all()


@router.get("/stats")
def stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    from app.models.workout import Workout
    from app.models.nutrition import Meal
    from app.models.chat import ChatSession
    return {
        "users": db.query(User).count(),
        "workouts": db.query(Workout).count(),
        "meals": db.query(Meal).count(),
        "chat_sessions": db.query(ChatSession).count(),
    }
