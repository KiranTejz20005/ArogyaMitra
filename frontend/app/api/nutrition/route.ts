import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { NextResponse } from "next/server"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

// Calorie calculation helpers
function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  // Mifflin-St Jeor Equation
  if (gender === "female") {
    return 10 * weight + 6.25 * height - 5 * age - 161
  }
  return 10 * weight + 6.25 * height - 5 * age + 5
}

function getActivityFactor(activityLevel: string): number {
  switch (activityLevel?.toLowerCase()) {
    case "beginner":
    case "sedentary":
      return 1.375
    case "intermediate":
    case "moderate":
      return 1.55
    case "advanced":
    case "active":
      return 1.725
    default:
      return 1.55
  }
}

function calculateDailyCalories(
  weight: number,
  height: number,
  age: number,
  gender: string,
  activityLevel: string,
  fitnessGoal: string
): number {
  const bmr = calculateBMR(weight, height, age, gender)
  const activityFactor = getActivityFactor(activityLevel)
  const tdee = bmr * activityFactor

  switch (fitnessGoal?.toLowerCase()) {
    case "weight_loss":
    case "lose weight":
      return Math.round(tdee - 500)
    case "muscle_gain":
    case "build muscle":
      return Math.round(tdee + 300)
    case "maintenance":
    case "stay fit":
    case "general_fitness":
    default:
      return Math.round(tdee)
  }
}

function getFallbackNutritionPlan(calories: number): any {
  return {
    daily_calories_target: calories,
    macro_targets: { protein_percent: 25, carbs_percent: 50, fat_percent: 25 },
    weekly_tips: [
      "Drink at least 3L of water daily",
      "Include a portion of protein in every meal",
      "Avoid processed sugars and refined flour",
      "Focus on leafy greens and seasonal vegetables",
      "Maintain consistent meal timings"
    ],
    daily_plans: Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      day_name: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i],
      total_calories: calories,
      meals: [
        { meal_type: "Breakfast", time: "8:00 AM", name: "Poha with vegetables", calories: Math.round(calories * 0.2), protein_g: 10, carbs_g: 40, fat_g: 8, ingredients: ["Beaten rice", "Onion", "Peas", "Peanuts"] },
        { meal_type: "Mid-Morning Snack", time: "11:00 AM", name: "Spiced Buttermilk or Fruit", calories: Math.round(calories * 0.1), protein_g: 5, carbs_g: 15, fat_g: 2, ingredients: ["Curd", "Jeera", "Salt"] },
        { meal_type: "Lunch", time: "1:30 PM", name: "Dal, Paneer Sabzi & 2 Rotis", calories: Math.round(calories * 0.35), protein_g: 20, carbs_g: 50, fat_g: 15, ingredients: ["Lentils", "Paneer", "Whole wheat flour"] },
        { meal_type: "Evening Snack", time: "5:00 PM", name: "Roasted Makhana or Nuts", calories: Math.round(calories * 0.1), protein_g: 5, carbs_g: 10, fat_g: 8, ingredients: ["Fox nuts", "Salt", "Turmeric"] },
        { meal_type: "Dinner", time: "8:00 PM", name: "Mixed Veg Khichdi & Curd", calories: Math.round(calories * 0.25), protein_g: 15, carbs_g: 35, fat_g: 10, ingredients: ["Rice", "Moong dal", "Vegetables"] }
      ]
    }))
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown> = {}
  let dailyCalories = 2000
  try {
    body = (await req.json()) as Record<string, unknown>
    const age = (body.age as number) ?? 25
    const gender = (body.gender as string) ?? "male"
    const weight = (body.weight as number) ?? 70
    const height = (body.height as number) ?? 170
    const fitness_goal = (body.fitness_goal as string) ?? "general_fitness"
    const activity_level = (body.activity_level as string) ?? "intermediate"

    const diet_preference = (body.diet_preference as string) ?? "vegetarian"
    const food_allergies = (body.food_allergies as string) ?? "None"

    dailyCalories = calculateDailyCalories(
      weight,
      height,
      age,
      gender,
      activity_level,
      fitness_goal
    )

    const prompt = `You are a certified nutritionist specializing in Indian cuisine. Generate a 7-day meal plan.

User Profile:
- Age: ${age}, Gender: ${gender}, Weight: ${weight}kg, Height: ${height}cm
- Fitness Goal: ${fitness_goal}
- Diet Type: ${diet_preference}
- Daily Calorie Target: ${dailyCalories} kcal
- Food Allergies: ${food_allergies}
- Cuisine Preference: Traditional Indian

Generate a JSON response with EXACTLY this structure (no markdown, no code fences, just raw JSON):
{
  "daily_calories_target": ${dailyCalories},
  "daily_plans": [
    {
      "day": 1,
      "day_name": "Monday",
      "total_calories": 0,
      "meals": [
        {
          "meal_type": "Breakfast",
          "time": "7:00 AM",
          "name": "Meal name here",
          "calories": 0,
          "protein_g": 0,
          "carbs_g": 0,
          "fat_g": 0,
          "ingredients": ["ingredient1", "ingredient2"]
        }
      ]
    }
  ],
  "weekly_tips": ["tip1", "tip2", "tip3", "tip4", "tip5"],
  "macro_targets": {
    "protein_percent": 30,
    "carbs_percent": 40,
    "fat_percent": 30
  }
}

Rules:
- All meals must be ${diet_preference}
- Avoid these allergens: ${food_allergies}
- Use traditional Indian recipes and realistic Indian ingredients
- 5 meals per day: Breakfast, Mid-Morning Snack, Lunch, Evening Snack, Dinner
- Each day's total calories should be close to ${dailyCalories} kcal
- Fill in realistic macro values (protein_g, carbs_g, fat_g) for every meal
- Total calories for each meal should add up to approximately the day's total
- Include 7 days (Monday through Sunday)
- Include 5 practical weekly tips
- Return ONLY valid JSON, no explanation text`

    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.7,
      maxTokens: 8000,
    })

    let nutritionPlan
    try {
      const text = result.text.trim()
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : text
      nutritionPlan = JSON.parse(jsonStr)
    } catch {
      console.error("AI Parse failed, using fallback")
      return NextResponse.json({
        plan: getFallbackNutritionPlan(dailyCalories),
        fallback: true,
        error: "AI parsing failed. Using optimized fallback plan."
      })
    }

    return NextResponse.json({
      plan: nutritionPlan,
      daily_calories_target: dailyCalories,
      bmr: calculateBMR(weight, height, age, gender),
    })
  } catch (error: unknown) {
    console.error("Nutrition API error:", error)
    return NextResponse.json({
      plan: getFallbackNutritionPlan(dailyCalories),
      fallback: true,
      error: "AI generation unavailable. Using optimized fallback plan."
    })
  }
}
