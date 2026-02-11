import { NextResponse } from "next/server"
import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { getTokenFromCookie } from "@/lib/backend-api"
import { API_CONFIG } from "@/config/api"

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

function getFallbackNutritionPlan(calories: number): any {
  return {
    daily_calories_target: calories,
    macro_targets: { protein_percent: 25, carbs_percent: 50, fat_percent: 25 },
    weekly_tips: [
      "Drink at least 3L of water daily",
      "Include more green leafy vegetables",
      "Avoid processed sugar and deep-fried foods",
      "Practice portion control",
    ],
    daily_plans: Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      day_name: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i],
      total_calories: calories,
      meals: [
        {
          meal_type: "Breakfast",
          time: "8:00 AM",
          name: "Poha with vegetables",
          calories: Math.round(calories * 0.2),
          protein_g: 10,
          carbs_g: 40,
          fat_g: 8,
          ingredients: ["Beaten rice", "Onion", "Peas", "Peanuts"],
        },
        {
          meal_type: "Lunch",
          time: "1:00 PM",
          name: "Dal Tadka with 2 Roti and Salad",
          calories: Math.round(calories * 0.35),
          protein_g: 25,
          carbs_g: 55,
          fat_g: 12,
          ingredients: ["Yellow lentils", "Whole wheat flour", "Cucumber", "Tomato"],
        },
        {
          meal_type: "Snack",
          time: "4:30 PM",
          name: "Roasted Makhana or Fruit",
          calories: Math.round(calories * 0.1),
          protein_g: 5,
          carbs_g: 20,
          fat_g: 4,
          ingredients: ["Fox nuts", "Seasonal fruit"],
        },
        {
          meal_type: "Dinner",
          time: "8:00 PM",
          name: "Paneer/Tofu Bhurji with 1 Roti",
          calories: Math.round(calories * 0.35),
          protein_g: 30,
          carbs_g: 35,
          fat_g: 15,
          ingredients: ["Paneer/Tofu", "Capsicum", "Onion", "Spices"],
        },
      ],
    })),
  }
}

export async function POST(req: Request) {
  const token = getTokenFromCookie(req.headers.get("cookie") ?? null)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const {
    age,
    gender,
    weight,
    height,
    fitness_goal,
    activity_level,
    diet_preference,
    food_allergies,
  } = await req.json()

  const bmr = gender === "male"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  }

  const tdee = bmr * (activityMultipliers[activity_level] || 1.375)
  let dailyCalories = Math.round(tdee)

  if (fitness_goal === "weight_loss") dailyCalories -= 500
  else if (fitness_goal === "muscle_gain") dailyCalories += 300

  try {
    const prompt = `You are a professional Indian nutritionist. Generate a 7-day personalized Indian meal plan for a user with the following profile:
    - Age: ${age}, Gender: ${gender}
    - Weight: ${weight}kg, Height: ${height}cm
    - Goal: ${fitness_goal}, Activity: ${activity_level}
    - Diet: ${diet_preference}, Allergies: ${food_allergies}
    - Daily Target: ${dailyCalories} calories

    Provide the output in STRICT JSON format with this structure:
    {
      "daily_calories_target": number,
      "macro_targets": { "protein_percent": number, "carbs_percent": number, "fat_percent": number },
      "weekly_tips": [string, string, ...],
      "daily_plans": [
        {
          "day": number,
          "day_name": string,
          "total_calories": number,
          "meals": [
            { "meal_type": string, "time": string, "name": string, "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "ingredients": [string, ...] }
          ]
        }
      ]
    }
    Use common Indian dishes like Poha, Upma, Dal, Roti, Sabzi, etc.
    Return ONLY valid JSON.`

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
    })

    const jsonStr = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1)
    let nutritionPlan
    try {
      nutritionPlan = JSON.parse(jsonStr)
    } catch {
      console.error("AI Parse failed, using fallback")
      return NextResponse.json({
        plan: getFallbackNutritionPlan(dailyCalories),
        fallback: true,
        error: "AI parsing failed. Using optimized fallback plan.",
      })
    }

    const saveRes = await fetch(`${API_CONFIG.getBackendUrl()}/nutrition/plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: `AI Plan - ${fitness_goal}`,
        description: `7-day ${diet_preference} meal plan for ${fitness_goal}`,
        daily_calories: dailyCalories,
        plan_data: nutritionPlan,
      }),
    })

    if (!saveRes.ok) {
      console.warn("Failed to save nutrition plan to backend")
      return NextResponse.json({
        plan: nutritionPlan,
        warning: "Plan generated but not saved to your profile.",
      })
    }

    const savedPlan = await saveRes.json()
    return NextResponse.json({ plan: { ...nutritionPlan, id: savedPlan.id } })

  } catch (error: unknown) {
    console.error("Nutrition API error:", error)
    return NextResponse.json({
      plan: getFallbackNutritionPlan(dailyCalories),
      fallback: true,
      error: "AI generation unavailable. Using optimized fallback plan.",
    })
  }
}
