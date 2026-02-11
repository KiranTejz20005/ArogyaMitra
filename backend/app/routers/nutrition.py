"""Nutrition and meals."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Any

from app.database import get_db
from app.models.user import User
from app.models.nutrition import Meal, NutritionLog, NutritionPlan
from app.core.deps import get_current_user

router = APIRouter()


class NutritionPlanCreate(BaseModel):
    name: str
    description: str | None = None
    daily_calories: float | None = None
    protein_grams: float | None = None
    carbs_grams: float | None = None
    fat_grams: float | None = None
    dietary_type: str | None = None
    is_active: bool = True


class MealCreate(BaseModel):
    name: str
    meal_type: str | None = None
    calories: float | None = None
    protein: float | None = None
    carbs: float | None = None
    fat: float | None = None
    ingredients: list[Any] | None = None
    day_of_week: str | None = None
    nutrition_plan_id: int | None = None


@router.get("/plans")
def list_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all nutrition plans with their meals."""
    plans = db.query(NutritionPlan).filter(NutritionPlan.user_id == current_user.id).order_by(NutritionPlan.created_at.desc()).all()
    result = []
    for p in plans:
        meals = db.query(Meal).filter(Meal.nutrition_plan_id == p.id, Meal.user_id == current_user.id).all()
        def _norm_ingredients(ing: Any) -> list:
            if not ing:
                return []
            if isinstance(ing, list):
                out = []
                for x in ing:
                    if isinstance(x, dict):
                        out.append({"name": x.get("name", str(x)), "quantity": x.get("quantity", "as needed")})
                    else:
                        out.append({"name": str(x), "quantity": "as needed"})
                return out
            return []
        result.append({
            "id": str(p.id),
            "name": p.name,
            "description": p.description,
            "daily_calories": p.daily_calories,
            "protein_grams": p.protein_grams,
            "carbs_grams": p.carbs_grams,
            "fat_grams": p.fat_grams,
            "dietary_type": p.dietary_type,
            "is_active": bool(p.is_active),
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "meals": [
                {
                    "id": str(m.id),
                    "name": m.name,
                    "meal_type": m.meal_type,
                    "calories": m.calories,
                    "protein_grams": m.protein,
                    "carbs_grams": m.carbs,
                    "fat_grams": m.fat,
                    "ingredients": _norm_ingredients(m.ingredients),
                    "day_of_week": m.day_of_week,
                }
                for m in meals
            ],
        })
    return result


@router.post("/plans", response_model=dict)
def create_plan(
    data: NutritionPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = NutritionPlan(
        user_id=current_user.id,
        name=data.name,
        description=data.description,
        daily_calories=data.daily_calories,
        protein_grams=data.protein_grams,
        carbs_grams=data.carbs_grams,
        fat_grams=data.fat_grams,
        dietary_type=data.dietary_type,
        is_active=1 if data.is_active else 0,
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return {"id": plan.id, "name": plan.name}


class PlanMealItem(BaseModel):
    name: str = ""
    meal_type: str | None = None
    time: str | None = None
    calories: float | None = None
    protein_g: float | None = None
    carbs_g: float | None = None
    fat_g: float | None = None
    ingredients: list[Any] | None = None
    day_of_week: str | None = None


@router.post("/plans/{plan_id}/meals", response_model=dict)
def add_plan_meals(
    plan_id: int,
    meals_data: list[PlanMealItem],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = db.query(NutritionPlan).filter(NutritionPlan.id == plan_id, NutritionPlan.user_id == current_user.id).first()
    if not plan:
        raise HTTPException(404, "Plan not found")
    for m in meals_data:
        meal = Meal(
            user_id=current_user.id,
            nutrition_plan_id=plan_id,
            name=m.name,
            meal_type=m.meal_type,
            calories=m.calories,
            protein=m.protein_g,
            carbs=m.carbs_g,
            fat=m.fat_g,
            ingredients=m.ingredients,
            day_of_week=m.day_of_week,
        )
        db.add(meal)
    db.commit()
    return {"added": len(meals_data)}


@router.delete("/plans/{plan_id}")
def delete_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = db.query(NutritionPlan).filter(NutritionPlan.id == plan_id, NutritionPlan.user_id == current_user.id).first()
    if not plan:
        raise HTTPException(404, "Plan not found")
    db.query(Meal).filter(Meal.nutrition_plan_id == plan_id).delete()
    db.delete(plan)
    db.commit()
    return {"ok": True}


@router.get("/meals")
def list_meals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Meal).filter(Meal.user_id == current_user.id).order_by(Meal.logged_at.desc()).all()


@router.post("/meals", response_model=dict)
def log_meal(
    data: MealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meal = Meal(user_id=current_user.id, **data.model_dump())
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return {"id": meal.id, "name": meal.name}


@router.get("/logs")
def list_nutrition_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(NutritionLog).filter(NutritionLog.user_id == current_user.id).all()


@router.get("/meals/{meal_id}")
def get_meal(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    m = db.query(Meal).filter(Meal.id == meal_id, Meal.user_id == current_user.id).first()
    if not m:
        raise HTTPException(404, "Meal not found")
    return m


@router.delete("/meals/{meal_id}")
def delete_meal(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    m = db.query(Meal).filter(Meal.id == meal_id, Meal.user_id == current_user.id).first()
    if not m:
        raise HTTPException(404, "Meal not found")
    db.delete(m)
    db.commit()
    return {"ok": True}
