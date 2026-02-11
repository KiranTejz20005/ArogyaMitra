"""Nutrition logic: aggregate meals, use Spoonacular for lookups."""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.nutrition import Meal
from app.services.spoonacular_service import search_ingredients, get_ingredient_info


def get_daily_totals(db: Session, user_id: int, date: datetime | None = None) -> dict:
    """Aggregate calories, protein, carbs, fat for a day."""
    date = date or datetime.utcnow()
    start = date.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)
    row = (
        db.query(
            func.coalesce(func.sum(Meal.calories), 0).label("calories"),
            func.coalesce(func.sum(Meal.protein), 0).label("protein"),
            func.coalesce(func.sum(Meal.carbs), 0).label("carbs"),
            func.coalesce(func.sum(Meal.fat), 0).label("fat"),
        )
        .filter(Meal.user_id == user_id, Meal.logged_at >= start, Meal.logged_at < end)
        .first()
    )
    return {
        "date": start.isoformat()[:10],
        "calories": float(row.calories or 0),
        "protein": float(row.protein or 0),
        "carbs": float(row.carbs or 0),
        "fat": float(row.fat or 0),
    } if row else {"date": start.isoformat()[:10], "calories": 0, "protein": 0, "carbs": 0, "fat": 0}


def search_nutrition(query: str, api_key: str | None = None) -> list[dict]:
    """Search Spoonacular for ingredients (for autocomplete / logging)."""
    return search_ingredients(query, api_key)


def get_nutrition_for_ingredient(ingredient_id: int, api_key: str | None = None) -> dict | None:
    """Get detailed nutrition for an ingredient."""
    return get_ingredient_info(ingredient_id, api_key)
