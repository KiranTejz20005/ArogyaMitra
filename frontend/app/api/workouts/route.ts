import { NextRequest, NextResponse } from "next/server"
import { getTokenFromCookie } from "@/lib/backend-api"
import { API_CONFIG } from "@/config/api"
import { DUMMY_PLAN } from "@/lib/dummy-workouts"
import { getVideoIdForExercise } from "@/lib/videos"

function normalizePlan(plan: { id?: number; name?: string; plan_data?: unknown } | null): typeof DUMMY_PLAN | null {
  if (!plan) return null
  let planData = plan.plan_data
  if (typeof planData === "string") {
    try {
      planData = JSON.parse(planData) as typeof planData
    } catch {
      planData = null
    }
  }
  const dailyWorkouts = (planData as { daily_workouts?: Array<{ exercises?: Array<{ name: string; youtube_url?: string | null }> }> } | null)?.daily_workouts ?? []
  const withVideos = dailyWorkouts.map((dw) => ({
    ...dw,
    exercises: (dw.exercises ?? []).map((ex) => ({
      ...ex,
      youtube_url: ex.youtube_url ?? (getVideoIdForExercise(ex.name) ? `https://www.youtube.com/watch?v=${getVideoIdForExercise(ex.name)}` : null),
    })),
  }))
  return {
    id: String(plan.id ?? "dummy"),
    name: plan.name ?? "Plan",
    plan_data: {
      ...(typeof planData === "object" && planData !== null ? planData : {}),
      daily_workouts: withVideos,
    },
  } as typeof DUMMY_PLAN
}

export async function GET(req: NextRequest) {
  const token = getTokenFromCookie(req.headers.get("cookie") ?? null)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const res = await fetch(`${API_CONFIG.getBackendUrl()}/workouts/plans`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (res.ok) {
      const data = await res.json()
      const rawPlan = Array.isArray(data) && data.length > 0 ? data[0] : null
      const plan = normalizePlan(rawPlan)
      if (plan) return NextResponse.json({ plan })
    }
  } catch {
    // backend unreachable
  }
  return NextResponse.json({ plan: DUMMY_PLAN, fallback: true })
}
