import { getDashboardUser } from "@/lib/get-dashboard-user"
import { getBackendProfileAndAssessment } from "@/lib/backend-profile"
import { getAppBaseUrl } from "@/lib/app-base-url"
import { NutritionView } from "@/components/dashboard/nutrition-view"

async function getNutritionData(userId: string, source: "supabase" | "backend") {
  if (source === "backend") {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const cookieHeader = cookieStore.toString()
    const [plansRes, { profile, assessment }] = await Promise.all([
      fetch(`${getAppBaseUrl()}/api/backend/nutrition/plans`, {
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
  const [{ data: nutritionPlans }, { data: profile }, { data: assessment }] =
    await Promise.all([
      supabase
        .from("nutrition_plans")
        .select("*, meals(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase
        .from("health_assessments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
    ])
  return {
    plans: nutritionPlans ?? [],
    profile,
    assessment,
  }
}

export default async function NutritionPage() {
  const user = await getDashboardUser()
  if (!user) return null

  const { plans, profile, assessment } = await getNutritionData(
    user.id,
    user.source
  )

  return (
    <NutritionView
      userId={user.id}
      nutritionPlans={plans}
      profile={profile}
      assessment={assessment}
      source={user.source}
    />
  )
}
