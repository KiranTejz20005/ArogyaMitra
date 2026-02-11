import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      )
    }

    const { data: assessment, error } = await supabase
      .from("health_assessments")
      .select(
        `
        id,
        age,
        gender,
        height_cm,
        weight_kg,
        bmi,
        bmi_category,
        fitness_level,
        fitness_goal,
        workout_preference,
        workout_time_preference,
        medical_history,
        health_conditions_text,
        injuries_text,
        food_allergies,
        medications,
        google_calendar_sync,
        status,
        created_at
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("Health assessment fetch error:", error)
      return NextResponse.json(
        { error: "Database error", message: error.message },
        { status: 500 }
      )
    }

    if (!assessment) {
      return NextResponse.json(null)
    }

    return NextResponse.json({
      ...assessment,
      health_conditions: assessment.health_conditions_text,
      injuries: assessment.injuries_text,
    })
  } catch (err) {
    console.error("Health assessment get error:", err)
    return NextResponse.json(
      { error: "Server error", message: "Failed to fetch assessment" },
      { status: 500 }
    )
  }
}
