import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  const { exerciseId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: {
    sets_completed?: number
    reps_completed?: number
    duration_minutes?: number
    calories_burned?: number
  } = {}
  try {
    body = await _req.json()
  } catch {
    // Empty body ok
  }

  const { data: exercise, error: exError } = await supabase
    .from("exercises")
    .select("id, workout_plan_id, name, day_of_week, day_number")
    .eq("id", exerciseId)
    .eq("user_id", user.id)
    .single()

  if (exError || !exercise) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 })
  }

  const dayNum =
    exercise.day_number ??
    ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(
      exercise.day_of_week ?? ""
    ) + 1

  const { error: insertError } = await supabase.from("exercise_completions").insert({
    user_id: user.id,
    workout_plan_id: exercise.workout_plan_id,
    exercise_id: exercise.id,
    exercise_name: exercise.name,
    day_number: dayNum,
    sets_completed: body.sets_completed ?? 0,
    reps_completed: body.reps_completed ?? 0,
    duration_minutes: body.duration_minutes ?? 0,
    calories_burned: body.calories_burned ?? 0,
  })

  if (insertError) {
    return NextResponse.json(
      { error: insertError.message },
      { status: 500 }
    )
  }

  // Update user's total_workouts and streak
  const { data: profile } = await supabase
    .from("profiles")
    .select("total_workouts, workout_streak, last_workout_date")
    .eq("id", user.id)
    .single()

  const today = new Date().toISOString().split("T")[0]
  const lastDate = profile?.last_workout_date
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split("T")[0]

  let newStreak = (profile?.workout_streak ?? 0) + 1
  if (lastDate) {
    if (lastDate === yesterdayStr) {
      newStreak = (profile?.workout_streak ?? 0) + 1
    } else if (lastDate !== today) {
      newStreak = 1
    }
  }

  await supabase
    .from("profiles")
    .update({
      total_workouts: (profile?.total_workouts ?? 0) + 1,
      workout_streak: newStreak,
      last_workout_date: today,
    })
    .eq("id", user.id)

  return NextResponse.json({
    success: true,
    stats: {
      total_workouts: (profile?.total_workouts ?? 0) + 1,
      workout_streak: newStreak,
    },
  })
}
