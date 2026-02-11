"""Google Calendar sync (placeholder - integrate calendar_service)."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.models.user import User
from app.core.deps import get_current_user

router = APIRouter()


class CalendarEventCreate(BaseModel):
    title: str
    start: str
    end: str
    description: str | None = None


@router.get("/events")
def list_events(current_user: User = Depends(get_current_user)):
    # TODO: use calendar_service to fetch from Google Calendar
    return {"events": [], "message": "Connect Google Calendar in settings"}


@router.post("/events", response_model=dict)
def create_event(
    data: CalendarEventCreate,
    current_user: User = Depends(get_current_user),
):
    # TODO: use calendar_service to create event
    return {"id": 0, "title": data.title, "message": "Google Calendar integration pending"}


@router.get("/auth-url")
def get_auth_url(current_user: User = Depends(get_current_user)):
    # TODO: return Google OAuth URL from calendar_service
    return {"url": "", "message": "Configure GOOGLE_CLIENT_ID and redirect_uri"}
