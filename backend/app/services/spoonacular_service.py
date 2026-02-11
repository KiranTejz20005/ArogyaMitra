"""Spoonacular API for nutrition data."""
import os
from typing import Any

SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY")
BASE_URL = "https://api.spoonacular.com"


def search_ingredients(query: str, api_key: str | None = None, number: int = 10) -> list[dict[str, Any]]:
    """Search ingredients for nutrition info."""
    key = api_key or SPOONACULAR_API_KEY
    if not key:
        return []
    try:
        import httpx
        r = httpx.get(
            f"{BASE_URL}/food/ingredients/search",
            params={"apiKey": key, "query": query, "number": number},
            timeout=10,
        )
        r.raise_for_status()
        return r.json().get("results", [])
    except Exception as e:
        print(f"ERROR: Spoonacular search_ingredients failed: {e}")
        return []


def get_ingredient_info(id: int, api_key: str | None = None) -> dict | None:
    """Get nutrition info for an ingredient by ID."""
    key = api_key or SPOONACULAR_API_KEY
    if not key:
        return None
    try:
        import httpx
        r = httpx.get(
            f"{BASE_URL}/food/ingredients/{id}/information",
            params={"apiKey": key, "amount": 1, "unit": "serving"},
            timeout=10,
        )
        r.raise_for_status()
        return r.json()
    except Exception:
        return None


def get_recipe_nutrition(recipe_id: int, api_key: str | None = None) -> dict | None:
    """Get nutrition summary for a recipe."""
    key = api_key or SPOONACULAR_API_KEY
    if not key:
        return None
    try:
        import httpx
        r = httpx.get(
            f"{BASE_URL}/recipes/{recipe_id}/nutritionWidget.json",
            params={"apiKey": key},
            timeout=10,
        )
        r.raise_for_status()
        return r.json()
    except Exception:
        return None
