import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getTokenFromCookie } from "@/lib/backend-api"
import { API_CONFIG } from "@/config/api"

function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10
}

function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight"
  if (bmi < 25) return "Normal"
  if (bmi < 30) return "Overweight"
  return "Obese"
}

function textToArray(s: string | undefined): string[] {
  if (!s || typeof s !== "string") return []
  return s
    .split(/[\n,]+/)
    .map((x) => x.trim())
    .filter(Boolean)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const age = typeof body.age === "number" ? body.age : parseInt(body.age, 10)
    const gender = typeof body.gender === "string" ? body.gender : String(body.gender || "")
    const height = typeof body.height === "number" ? body.height : parseFloat(body.height)
    const weight = typeof body.weight === "number" ? body.weight : parseFloat(body.weight)

    if (
      isNaN(age) ||
      !gender ||
      isNaN(height) ||
      height <= 0 ||
      isNaN(weight) ||
      weight <= 0
    ) {
      return NextResponse.json(
        { error: "Validation error", message: "Age, gender, height, and weight are required" },
        { status: 400 }
      )
    }

    const bmi = calculateBMI(weight, height)
    const bmiCat = bmiCategory(bmi)
    const fitnessLevel = body.fitness_level || ""
    const fitnessGoal = body.fitness_goal || ""
    const workoutPreference = body.workout_preference || ""
    const workoutTimePreference = body.workout_time_preference || ""
    const healthConditions = textToArray(body.health_conditions)
    const injuries = textToArray(body.injuries)
    const notes = [body.medical_history, body.food_allergies, body.medications]
      .filter(Boolean)
      .join("\n\n")

    // Try Supabase first
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: assessment, error } = await supabase
        .from("health_assessments")
        .insert({
          user_id: user.id,
          age,
          gender,
          height_cm: height,
          weight_kg: weight,
          bmi,
          bmi_category: bmiCat,
          fitness_level: fitnessLevel,
          fitness_goal: fitnessGoal,
          workout_preference: workoutPreference,
          workout_time_preference: workoutTimePreference,
          medical_history: body.medical_history || null,
          health_conditions_text: body.health_conditions || null,
          injuries_text: body.injuries || null,
          food_allergies: body.food_allergies || null,
          medications: body.medications || null,
          google_calendar_sync: Boolean(body.google_calendar_sync ?? false),
          status: "completed",
        })
        .select("id, bmi, status")
        .single()

      if (error) {
        console.error("Health assessment insert error:", error)
        return NextResponse.json(
          { error: "Database error", message: error.message },
          { status: 500 }
        )
      }
      return NextResponse.json({
        assessment_id: assessment.id,
        bmi: assessment.bmi,
        status: assessment.status,
      })
    }

    // Backend auth: submit to FastAPI
    const token = getTokenFromCookie(req.headers.get("cookie") ?? null)
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please sign in to save your assessment" },
        { status: 401 }
      )
    }

    const res = await fetch(`${API_CONFIG.getBackendUrl()}/health/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        age,
        gender,
        height_cm: height,
        weight_kg: weight,
        bmi,
        bmi_category: bmiCat,
        activity_level: fitnessLevel || undefined,
        fitness_goal: fitnessGoal || undefined,
        fitness_level: fitnessLevel || undefined,
        workout_preference: workoutPreference || undefined,
        workout_time_preference: workoutTimePreference || undefined,
        health_conditions: healthConditions.length ? healthConditions : undefined,
        injuries: injuries.length ? injuries : undefined,
        notes: notes || undefined,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: err.detail || "Failed to save assessment", message: err.detail || "Please try again" },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json({
      assessment_id: data.id,
      bmi: data.bmi ?? bmi,
      status: "completed",
    })
  } catch (err) {
    console.error("Health assessment submit error:", err)
    return NextResponse.json(
      { error: "Server error", message: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
