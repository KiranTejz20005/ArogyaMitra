import aiohttp
import os
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY")

async def get_meal_plan_week(calories: int, diet: str = None, exclude: str = None) -> Dict[str, Any]:
    """Get a 7-day meal plan from Spoonacular"""
    if not SPOONACULAR_API_KEY:
        logger.warning("SPOONACULAR_API_KEY not found in environment")
        raise Exception("Spoonacular API key missing")

    url = "https://api.spoonacular.com/mealplanner/generate"
    params = {
        "apiKey": SPOONACULAR_API_KEY,
        "timeFrame": "week",
        "targetCalories": calories,
        "diet": diet,
        "exclude": exclude
    }

    async with aiohttp.ClientSession() as session:
        async with session.get(url, params={k: v for k, v in params.items() if v}) as response:
            if response.status != 200:
                error_data = await response.text()
                logger.error(f"Spoonacular API error: {error_data}")
                raise Exception(f"Spoonacular API failed with status {response.status}")
            return await response.json()

async def get_recipe_info(recipe_id: int) -> Dict[str, Any]:
    """Get detailed information about a recipe"""
    if not SPOONACULAR_API_KEY:
        raise Exception("Spoonacular API key missing")

    url = f"https://api.spoonacular.com/recipes/{recipe_id}/information"
    params = {"apiKey": SPOONACULAR_API_KEY}

    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=params) as response:
            if response.status != 200:
                raise Exception(f"Spoonacular API failed with status {response.status}")
            return await response.json()
