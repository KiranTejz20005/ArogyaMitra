import { NextResponse } from "next/server"
import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { getTokenFromCookie } from "@/lib/backend-api"
import { API_CONFIG } from "@/config/api"

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const BREAKFAST_OPTIONS = [
  { name: "Poha with vegetables", protein_g: 10, carbs_g: 40, fat_g: 8, ingredients: ["Beaten rice", "Onion", "Peas", "Peanuts"] },
  { name: "Upma with coconut chutney", protein_g: 8, carbs_g: 45, fat_g: 6, ingredients: ["Semolina", "Vegetables", "Coconut", "Curry leaves"] },
  { name: "Idli with sambar", protein_g: 12, carbs_g: 38, fat_g: 4, ingredients: ["Rice idli", "Lentil sambar", "Coconut chutney"] },
  { name: "Paratha with curd", protein_g: 11, carbs_g: 42, fat_g: 10, ingredients: ["Whole wheat", "Potato/Aloo", "Curd"] },
  { name: "Oats with nuts and banana", protein_g: 9, carbs_g: 44, fat_g: 7, ingredients: ["Oats", "Almonds", "Banana", "Milk"] },
  { name: "Dosa with chutney", protein_g: 7, carbs_g: 48, fat_g: 5, ingredients: ["Rice batter", "Coconut chutney", "Sambar"] },
  { name: "Besan chilla with green chutney", protein_g: 14, carbs_g: 35, fat_g: 9, ingredients: ["Gram flour", "Onion", "Coriander chutney"] },
]

const LUNCH_OPTIONS = [
  { name: "Dal Tadka with 2 Roti and Salad", protein_g: 25, carbs_g: 55, fat_g: 12, ingredients: ["Yellow lentils", "Whole wheat flour", "Cucumber", "Tomato"] },
  { name: "Rajma Chawal with Salad", protein_g: 22, carbs_g: 58, fat_g: 10, ingredients: ["Kidney beans", "Rice", "Onion", "Cucumber"] },
  { name: "Chole with Bhature (1) and Salad", protein_g: 20, carbs_g: 62, fat_g: 14, ingredients: ["Chickpeas", "Flour", "Salad"] },
  { name: "Fish curry with rice and vegetables", protein_g: 28, carbs_g: 48, fat_g: 11, ingredients: ["Fish", "Rice", "Vegetables", "Spices"] },
  { name: "Kadhi with steamed rice and sabzi", protein_g: 18, carbs_g: 52, fat_g: 13, ingredients: ["Yogurt", "Besan", "Rice", "Seasonal sabzi"] },
  { name: "Vegetable Khichdi with papad", protein_g: 16, carbs_g: 55, fat_g: 8, ingredients: ["Rice", "Moong dal", "Vegetables", "Ghee"] },
  { name: "Paneer Butter Masala with 2 Roti", protein_g: 24, carbs_g: 50, fat_g: 18, ingredients: ["Paneer", "Tomato", "Cream", "Whole wheat"] },
]

const SNACK_OPTIONS = [
  { name: "Roasted Makhana or Fruit", protein_g: 5, carbs_g: 20, fat_g: 4, ingredients: ["Fox nuts", "Seasonal fruit"] },
  { name: "Sprouted Chaat", protein_g: 8, carbs_g: 22, fat_g: 3, ingredients: ["Moong sprouts", "Onion", "Lemon", "Sev"] },
  { name: "Greek yogurt with honey", protein_g: 12, carbs_g: 18, fat_g: 2, ingredients: ["Yogurt", "Honey", "Nuts"] },
  { name: "Mixed nuts and dates", protein_g: 6, carbs_g: 24, fat_g: 14, ingredients: ["Almonds", "Walnuts", "Dates"] },
  { name: "Vegetable soup", protein_g: 4, carbs_g: 15, fat_g: 2, ingredients: ["Mixed vegetables", "Herbs"] },
  { name: "Dhokla with chutney", protein_g: 10, carbs_g: 28, fat_g: 5, ingredients: ["Chickpea flour", "Coconut chutney"] },
  { name: "Fruit salad with seeds", protein_g: 3, carbs_g: 26, fat_g: 6, ingredients: ["Seasonal fruits", "Chia seeds", "Pumpkin seeds"] },
]

const DINNER_OPTIONS = [
  { name: "Paneer/Tofu Bhurji with 1 Roti", protein_g: 30, carbs_g: 35, fat_g: 15, ingredients: ["Paneer/Tofu", "Capsicum", "Onion", "Spices"] },
  { name: "Grilled chicken with vegetables and roti", protein_g: 35, carbs_g: 30, fat_g: 12, ingredients: ["Chicken", "Bell peppers", "Onion", "Roti"] },
  { name: "Moong dal cheela with curd", protein_g: 22, carbs_g: 38, fat_g: 8, ingredients: ["Moong dal", "Onion", "Curd"] },
  { name: "Vegetable pulao with raita", protein_g: 14, carbs_g: 52, fat_g: 10, ingredients: ["Rice", "Mixed vegetables", "Yogurt"] },
  { name: "Egg curry with 1 Roti", protein_g: 28, carbs_g: 32, fat_g: 14, ingredients: ["Eggs", "Tomato", "Onion", "Roti"] },
  { name: "Lauki sabzi with chapati and dal", protein_g: 18, carbs_g: 45, fat_g: 9, ingredients: ["Bottle gourd", "Chapati", "Dal"] },
  { name: "Quinoa upma with vegetables", protein_g: 16, carbs_g: 42, fat_g: 11, ingredients: ["Quinoa", "Vegetables", "Spices"] },
]

function pickOption<T>(options: T[], seed: number): T {
  return options[Math.abs(seed) % options.length]
}

function getFallbackNutritionPlan(calories: number, dietPreference?: string): any {
  const seed = Date.now()
  const tipsPool = [
    "Drink at least 3L of water daily",
    "Include more green leafy vegetables",
    "Avoid processed sugar and deep-fried foods",
    "Practice portion control",
    "Eat a variety of colors on your plate",
    "Have your last meal 2–3 hours before sleep",
    "Include protein in every meal",
    "Choose whole grains over refined",
  ]
  const weekly_tips = [
    tipsPool[(seed + 0) % tipsPool.length],
    tipsPool[(seed + 1) % tipsPool.length],
    tipsPool[(seed + 2) % tipsPool.length],
    tipsPool[(seed + 3) % tipsPool.length],
  ]
  return {
    daily_calories_target: calories,
    macro_targets: { protein_percent: 25, carbs_percent: 50, fat_percent: 25 },
    weekly_tips,
    daily_plans: Array.from({ length: 7 }, (_, i) => {
      const daySeed = seed + (i + 1) * 31
      const bf = pickOption(BREAKFAST_OPTIONS, daySeed)
      const lunch = pickOption(LUNCH_OPTIONS, daySeed + 7)
      const snack = pickOption(SNACK_OPTIONS, daySeed + 13)
      const dinner = pickOption(DINNER_OPTIONS, daySeed + 19)
      return {
        day: i + 1,
        day_name: DAY_NAMES[i],
        total_calories: calories,
        meals: [
          { meal_type: "Breakfast", time: "8:00 AM", name: bf.name, calories: Math.round(calories * 0.2), protein_g: bf.protein_g, carbs_g: bf.carbs_g, fat_g: bf.fat_g, ingredients: bf.ingredients },
          { meal_type: "Lunch", time: "1:00 PM", name: lunch.name, calories: Math.round(calories * 0.35), protein_g: lunch.protein_g, carbs_g: lunch.carbs_g, fat_g: lunch.fat_g, ingredients: lunch.ingredients },
          { meal_type: "Snack", time: "4:30 PM", name: snack.name, calories: Math.round(calories * 0.1), protein_g: snack.protein_g, carbs_g: snack.carbs_g, fat_g: snack.fat_g, ingredients: snack.ingredients },
          { meal_type: "Dinner", time: "8:00 PM", name: dinner.name, calories: Math.round(calories * 0.35), protein_g: dinner.protein_g, carbs_g: dinner.carbs_g, fat_g: dinner.fat_g, ingredients: dinner.ingredients },
        ],
      }
    }),
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
    const varietyHint = `Request timestamp: ${Date.now()}. Generate a UNIQUE plan this time.`
    const prompt = `You are a professional Indian nutritionist. ${varietyHint}

Generate a 7-day personalized Indian meal plan for a user with the following profile:
- Age: ${age}, Gender: ${gender}
- Weight: ${weight}kg, Height: ${height}cm
- Goal: ${fitness_goal}, Activity: ${activity_level}
- Diet preference: ${diet_preference}, Allergies: ${food_allergies}
- Daily Target: ${dailyCalories} calories

IMPORTANT: Vary the meals every day. Do NOT repeat the same dishes across days. Each day must have different breakfast, lunch, snack, and dinner. Respect diet preference (e.g. vegetarian, vegan, non-vegetarian) and suggest a wide variety of Indian dishes accordingly.

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
Use a diverse set of Indian dishes (e.g. Poha, Upma, Idli, Dosa, different dals, various sabzis, regional specials) and vary them by day.
Return ONLY valid JSON.`

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.85,
    })

    const jsonStr = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1)
    let nutritionPlan
    try {
      nutritionPlan = JSON.parse(jsonStr)
    } catch {
      console.error("AI Parse failed, using fallback")
      return NextResponse.json({
        plan: getFallbackNutritionPlan(dailyCalories, diet_preference),
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
      plan: getFallbackNutritionPlan(dailyCalories, diet_preference),
      fallback: true,
      error: "AI generation unavailable. Using optimized fallback plan.",
    })
  }
}
