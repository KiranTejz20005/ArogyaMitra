import { NextRequest, NextResponse } from "next/server"
import { getTokenFromCookie } from "@/lib/backend-api"
import { API_CONFIG } from "@/config/api"

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

interface DailyWorkout {
  day: number
  day_name: string
  focus: string
  total_duration: number
  recommended_time: string
  warmup: string
  cooldown: string
  exercises?: Array<{
    name: string
    sets?: number
    reps?: string
    rest_seconds?: number
    difficulty?: string
    instructions?: string
    youtube_url?: string | null
  }>
}

export async function GET(req: NextRequest) {
  const token = getTokenFromCookie(req.headers.get("cookie") ?? null)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const today = new Date()
  const dayName = DAY_NAMES[today.getDay()]

  const res = await fetch(`${API_CONFIG.getBackendUrl()}/workouts/plans`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    return NextResponse.json({ workout: null, status: "no_plan", day_name: dayName })
  }
  const plans = await res.json()
  const plan = Array.isArray(plans) && plans.length > 0 ? plans[0] : null
  const planData = plan?.plan_data as { daily_workouts?: DailyWorkout[] } | null | undefined
  const dailyWorkouts = planData?.daily_workouts ?? []

  const todayWorkout = dailyWorkouts.find(
    (d: DailyWorkout) => d.day_name?.toLowerCase() === dayName.toLowerCase()
  )

  if (!todayWorkout) {
    return NextResponse.json({
      workout: null,
      status: "rest_day",
      day_name: dayName,
      message: "Rest day – take it easy and recover.",
    })
  }

  const exercises = todayWorkout.exercises ?? []
  return NextResponse.json({
    workout: {
      day_name: todayWorkout.day_name,
      focus: todayWorkout.focus,
      total_duration: todayWorkout.total_duration ?? 0,
      recommended_time: todayWorkout.recommended_time ?? "",
      warmup: todayWorkout.warmup ?? "",
      cooldown: todayWorkout.cooldown ?? "",
      exercises: exercises.map((e) => ({
        id: e.name,
        name: e.name,
        sets: e.sets ?? 3,
        reps: e.reps ?? "10",
        rest_seconds: e.rest_seconds ?? 45,
        difficulty: e.difficulty ?? "beginner",
        instructions: e.instructions ?? "",
        youtube_url: e.youtube_url ?? null,
      })),
      plan_id: String(plan?.id ?? ""),
      status: "incomplete",
      completed_exercises: [],
    },
    day_name: dayName,
  })
}
