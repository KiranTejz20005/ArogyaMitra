import { getDashboardUser } from "@/lib/get-dashboard-user"
import { WorkoutPlansView } from "@/components/dashboard/workout-plans-view"

async function getWorkoutData(userId: string, source: "supabase" | "backend") {
  if (source === "backend") {
    const { cookies } = await import("next/headers")
    const { getAppBaseUrl } = await import("@/lib/app-base-url")
    const cookieStore = await cookies()
    const res = await fetch(`${getAppBaseUrl()}/api/backend/workouts/plans`, {
      headers: { cookie: cookieStore.toString() },
    })
    if (!res.ok) return { plans: [], profile: null }
    const plans = await res.json()
    return {
      plans: Array.isArray(plans) ? plans : [],
      profile: null,
    }
  }
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  const [{ data: workoutPlans }, { data: profile }] = await Promise.all([
    supabase
      .from("workout_plans")
      .select("*, exercises(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("fitness_goal, activity_level")
      .eq("id", userId)
      .single(),
  ])
  return {
    plans: workoutPlans ?? [],
    profile,
  }
}

export default async function WorkoutsPage() {
  const user = await getDashboardUser()
  if (!user) return null

  const { plans, profile } = await getWorkoutData(user.id, user.source)

  return (
    <WorkoutPlansView
      userId={user.id}
      workoutPlans={plans}
      profile={profile}
    />
  )
}
