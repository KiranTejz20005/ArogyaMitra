import { getDashboardUser } from "@/lib/get-dashboard-user"
import { AssessmentForm } from "@/components/dashboard/assessment-form"

async function getAssessmentData(userId: string, source: "supabase" | "backend") {
  if (source === "backend") {
    const { cookies } = await import("next/headers")
    const { getAppBaseUrl } = await import("@/lib/app-base-url")
    const cookieStore = await cookies()
    const res = await fetch(`${getAppBaseUrl()}/api/backend/health`, {
      headers: { cookie: cookieStore.toString() },
    })
    if (!res.ok) return { profile: null, assessment: null }
    const assessment = await res.json()
    const profile = assessment
      ? {
          height_cm: assessment.height_cm ?? null,
          weight_kg: assessment.weight_kg ?? null,
          age: assessment.age ?? null,
          gender: assessment.gender ?? null,
          fitness_goal: assessment.fitness_goal ?? null,
          activity_level: assessment.activity_level ?? null,
          dietary_preference: assessment.dietary_preference ?? null,
        }
      : null
    return { profile, assessment: assessment && Object.keys(assessment).length ? assessment : null }
  }
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  const [{ data: profile }, { data: assessment }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase
      .from("health_assessments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
  ])
  return { profile, assessment }
}

export default async function AssessmentPage() {
  const user = await getDashboardUser()
  if (!user) return null

  const { profile, assessment } = await getAssessmentData(user.id, user.source)

  return (
    <AssessmentForm
      userId={user.id}
      profile={profile}
      existingAssessment={assessment}
    />
  )
}
