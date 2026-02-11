import { getAppBaseUrl } from "@/lib/app-base-url"

export interface BackendProfile {
  full_name: string | null
  email?: string | null
  avatar_url: null
  age: number | null
  gender: string | null
  height_cm: number | null
  weight_kg: number | null
  fitness_goal: string | null
  activity_level: string | null
  dietary_preference: string | null
}

export interface BackendAssessment {
  bmi: number | null
  bmi_category: string | null
  health_conditions: string[] | null
  sleep_hours: number | null
  stress_level: string | null
  age?: number | null
  gender?: string | null
  height_cm?: number | null
  weight_kg?: number | null
  fitness_goal?: string | null
  activity_level?: string | null
  dietary_preference?: string | null
}

/** Fetches backend user (auth/me) and health assessment, returns merged profile + assessment for dashboard use. */
export async function getBackendProfileAndAssessment(cookieHeader: string): Promise<{
  profile: BackendProfile | null
  assessment: BackendAssessment | null
}> {
  const base = getAppBaseUrl()
  const [userRes, healthRes] = await Promise.all([
    fetch(`${base}/api/backend/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    }),
    fetch(`${base}/api/backend/health`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    }),
  ])
  const user = userRes.ok ? await userRes.json() : null
  const rawAssessment = healthRes.ok ? await healthRes.json() : null
  const assessment: BackendAssessment | null = rawAssessment && typeof rawAssessment === "object"
    ? {
        bmi: rawAssessment.bmi ?? null,
        bmi_category: rawAssessment.bmi_category ?? null,
        health_conditions: rawAssessment.health_conditions ?? null,
        sleep_hours: rawAssessment.sleep_hours ?? null,
        stress_level: rawAssessment.stress_level ?? null,
      }
    : null

  const profile: BackendProfile | null = user
    ? {
        full_name: user.full_name ?? null,
        email: user.email ?? null,
        avatar_url: null,
        age: rawAssessment?.age ?? null,
        gender: rawAssessment?.gender ?? null,
        height_cm: rawAssessment?.height_cm ?? null,
        weight_kg: rawAssessment?.weight_kg ?? null,
        fitness_goal: rawAssessment?.fitness_goal ?? null,
        activity_level: rawAssessment?.activity_level ?? null,
        dietary_preference: rawAssessment?.dietary_preference ?? null,
      }
    : null

  return { profile, assessment }
}
