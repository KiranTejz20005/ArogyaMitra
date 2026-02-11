"""Workout business logic and optional YouTube exercise video lookup."""
from app.services.youtube_service import search_exercise_videos


def get_workout_with_videos(exercises: list[dict], api_key: str | None) -> list[dict]:
    """Enrich exercise list with YouTube video IDs if API key is set."""
    if not api_key or not exercises:
        return exercises
    result = []
    for ex in exercises:
        name = ex.get("name") or ex.get("exercise_name") or ""
        video_id = ex.get("video_id")
        if not video_id and name:
            videos = search_exercise_videos(name, api_key, max_results=1)
            if videos:
                ex = {**ex, "video_id": videos[0].get("id", {}).get("videoId")}
        result.append(ex)
    return result
