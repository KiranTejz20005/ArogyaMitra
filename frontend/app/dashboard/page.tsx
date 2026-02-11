import { cookies } from "next/headers"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { getAppBaseUrl } from "@/lib/app-base-url"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const base = getAppBaseUrl()
  const cookieHeader = cookieStore.toString()

  const [userRes, assessmentRes, plansRes, progressRes] = await Promise.all([
    fetch(`${base}/api/backend/auth/me`, { headers: { cookie: cookieHeader }, cache: "no-store" }),
    fetch(`${base}/api/backend/health`, { headers: { cookie: cookieHeader }, cache: "no-store" }),
    fetch(`${base}/api/backend/workouts/plans`, { headers: { cookie: cookieHeader }, cache: "no-store" }),
    fetch(`${base}/api/backend/progress`, { headers: { cookie: cookieHeader }, cache: "no-store" }),
  ])

  const user = userRes.ok ? ((await userRes.json()) as { id: number; email?: string; full_name?: string | null }) : null
  const assessment = assessmentRes.ok ? await assessmentRes.json() : null
  const plans = plansRes.ok ? await plansRes.json() : []
  const progressList = progressRes.ok ? await progressRes.json() : []

  const profile = user
    ? {
        full_name: user.full_name ?? null,
        weight_kg: (assessment as { bmi?: number })?.bmi ?? null,
        fitness_goal: (assessment as { fitness_goal?: string })?.fitness_goal ?? null,
      }
    : null

  const assessmentMapped = assessment
    ? {
        bmi: (assessment as { bmi?: number }).bmi ?? null,
        bmi_category: (assessment as { bmi_category?: string }).bmi_category ?? null,
        sleep_hours: (assessment as { sleep_hours?: number }).sleep_hours ?? null,
        water_intake_liters: null,
        stress_level: (assessment as { stress_level?: string }).stress_level ?? null,
      }
    : null

  const workoutPlans = Array.isArray(plans)
    ? plans.map((p: { id: number; name: string; difficulty?: string | null }) => ({
        id: String(p.id),
        name: p.name,
        difficulty: p.difficulty ?? null,
        is_active: true,
      }))
    : []

  const progressRecords = Array.isArray(progressList)
    ? progressList.slice(0, 7).map((p: { id: number; value?: number; recorded_at?: string }) => ({
        id: String(p.id),
        weight_kg: p.value ?? null,
        calories_consumed: null,
        calories_burned: null,
        steps: null,
        water_liters: null,
        sleep_hours: null,
        recorded_date: p.recorded_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      }))
    : []

  return (
    <DashboardContent
      profile={profile}
      assessment={assessmentMapped}
      workoutPlans={workoutPlans}
      progressRecords={progressRecords}
      achievements={[]}
    />
  )
}
