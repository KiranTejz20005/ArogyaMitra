"""Google Calendar API for schedule syncing."""
import os
from typing import Any

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")


def get_auth_url(state: str | None = None) -> str:
    """Build Google OAuth2 URL for Calendar scope."""
    if not GOOGLE_CLIENT_ID or not GOOGLE_REDIRECT_URI:
        return ""
    try:
        from google_auth_oauthlib.flow import Flow
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET or "",
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [GOOGLE_REDIRECT_URI],
                }
            },
            scopes=["https://www.googleapis.com/auth/calendar.events", "https://www.googleapis.com/auth/calendar.readonly"],
        )
        flow.redirect_uri = GOOGLE_REDIRECT_URI
        url, _ = flow.authorization_url(access_type="offline", state=state or "", prompt="consent")
        return url
    except Exception:
        return ""


def list_events(access_token: str, max_results: int = 50) -> list[dict[str, Any]]:
    """Fetch upcoming events using access token (simplified; full flow would store refresh token)."""
    if not access_token:
        return []
    try:
        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build
        creds = Credentials(token=access_token)
        service = build("calendar", "v3", credentials=creds)
        from datetime import datetime, timezone
        now = datetime.utcnow().replace(tzinfo=timezone.utc).isoformat()
        events_result = service.events().list(
            calendarId="primary",
            timeMin=now,
            maxResults=max_results,
            singleEvents=True,
            orderBy="startTime",
        ).execute()
        return events_result.get("items", [])
    except Exception:
        return []
