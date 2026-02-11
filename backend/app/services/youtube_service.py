"""YouTube Data API v3 for exercise videos."""
import os
from typing import Any

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")


def search_exercise_videos(query: str, api_key: str | None = None, max_results: int = 5) -> list[dict[str, Any]]:
    """Search YouTube for exercise/how-to videos. Returns list of items from API."""
    key = api_key or YOUTUBE_API_KEY
    if not key:
        return []
    try:
        from googleapiclient.discovery import build
        youtube = build("youtube", "v3", developerKey=key)
        req = youtube.search().list(
            part="snippet",
            q=f"{query} exercise tutorial",
            type="video",
            maxResults=max_results,
            videoDuration="short",
            safeSearch="strict",
        )
        res = req.execute()
        return res.get("items", [])
    except Exception:
        return []


def get_video_details(video_ids: list[str], api_key: str | None = None) -> list[dict]:
    """Fetch title, description, duration for given video IDs."""
    key = api_key or YOUTUBE_API_KEY
    if not key or not video_ids:
        return []
    try:
        from googleapiclient.discovery import build
        youtube = build("youtube", "v3", developerKey=key)
        res = youtube.videos().list(part="snippet,contentDetails", id=",".join(video_ids[:50])).execute()
        return res.get("items", [])
    except Exception:
        return []
