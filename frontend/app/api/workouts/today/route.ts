import { NextRequest, NextResponse } from "next/server"
import { getTokenFromCookie } from "@/lib/backend-api"
import { API_CONFIG } from "@/config/api"
import { getDummyTodayWorkout } from "@/lib/dummy-workouts"
import { getVideoIdForExercise } from "@/lib/videos"

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

function mapExercise(e: { name: string; sets?: number; reps?: string; rest_seconds?: number; difficulty?: string; instructions?: string; youtube_url?: string | null }) {
  const videoId = getVideoIdForExercise(e.name)
  return {
    id: e.name,
    name: e.name,
    sets: e.sets ?? 3,
    reps: e.reps ?? "10",
    rest_seconds: e.rest_seconds ?? 45,
    difficulty: e.difficulty ?? "beginner",
    instructions: e.instructions ?? "",
    youtube_url: e.youtube_url ?? (videoId ? `https://www.youtube.com/watch?v=${videoId}` : null),
  }
}

export async function GET(req: NextRequest) {
  const token = getTokenFromCookie(req.headers.get("cookie") ?? null)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const today = new Date()
  const dayName = DAY_NAMES[today.getDay()]

  let plan: { id?: number; plan_data?: string | { daily_workouts?: DailyWorkout[] } } | null = null
  try {
    const res = await fetch(`${API_CONFIG.getBackendUrl()}/workouts/plans`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (res.ok) {
      const plans = await res.json()
      plan = Array.isArray(plans) && plans.length > 0 ? plans[0] : null
    }
  } catch {
    // backend unreachable
  }

  let planData = plan?.plan_data
  if (typeof planData === "string") {
    try {
      planData = JSON.parse(planData) as { daily_workouts?: DailyWorkout[] }
    } catch {
      planData = undefined
    }
  }
  const dailyWorkouts = (planData as { daily_workouts?: DailyWorkout[] } | undefined)?.daily_workouts ?? []
  const todayWorkout = dailyWorkouts.find((d: DailyWorkout) => d.day_name?.toLowerCase() === dayName.toLowerCase())

  if (todayWorkout) {
    const exercises = todayWorkout.exercises ?? []
    return NextResponse.json({
      workout: {
        day_name: todayWorkout.day_name,
        focus: todayWorkout.focus,
        total_duration: todayWorkout.total_duration ?? 0,
        recommended_time: todayWorkout.recommended_time ?? "",
        warmup: todayWorkout.warmup ?? "",
        cooldown: todayWorkout.cooldown ?? "",
        exercises: exercises.map((e) => mapExercise(e)),
        plan_id: String(plan?.id ?? ""),
        status: "incomplete",
        completed_exercises: [],
      },
      day_name: dayName,
    })
  }

  const dummy = getDummyTodayWorkout()
  if (dummy.exercises.length === 0) {
    return NextResponse.json({
      workout: null,
      status: "rest_day",
      day_name: dayName,
      message: "Rest day – take it easy and recover.",
    })
  }

  return NextResponse.json({
    workout: {
      day_name: dummy.day_name,
      focus: dummy.focus,
      total_duration: dummy.total_duration,
      recommended_time: dummy.recommended_time,
      warmup: dummy.warmup,
      cooldown: dummy.cooldown,
      exercises: dummy.exercises.map((e) => mapExercise(e)),
      plan_id: "dummy",
      status: "incomplete",
      completed_exercises: [],
    },
    day_name: dayName,
    fallback: true,
  })
}
