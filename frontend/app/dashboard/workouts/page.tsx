import { getDashboardUser } from "@/lib/get-dashboard-user"
import { getBackendProfileAndAssessment } from "@/lib/backend-profile"
import { getAppBaseUrl } from "@/lib/app-base-url"
import { WorkoutPlansView } from "@/components/dashboard/workout-plans-view"

async function getWorkoutData(userId: string, source: "supabase" | "backend") {
  if (source === "backend") {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const cookieHeader = cookieStore.toString()
    const [plansRes, { profile, assessment }] = await Promise.all([
      fetch(`${getAppBaseUrl()}/api/backend/workouts/plans`, {
        headers: { cookie: cookieHeader },
        cache: "no-store",
      }),
      getBackendProfileAndAssessment(cookieHeader),
    ])
    const plans = plansRes.ok ? await plansRes.json() : []
    return {
      plans: Array.isArray(plans) ? plans : [],
      profile,
      assessment,
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
    assessment: null,
  }
}

export default async function WorkoutsPage() {
  const user = await getDashboardUser()
  if (!user) return null

  const { plans, profile, assessment } = await getWorkoutData(user.id, user.source)

  return (
    <WorkoutPlansView
      userId={user.id}
      workoutPlans={plans}
      profile={profile}
      assessment={assessment}
    />
  )
}
