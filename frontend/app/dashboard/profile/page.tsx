import { getDashboardUser } from "@/lib/get-dashboard-user"
import { ProfileView } from "@/components/dashboard/profile-view"

async function getProfileData(userId: string, source: "supabase" | "backend") {
  if (source === "backend") {
    const base =
      process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : "http://localhost:3000"
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const res = await fetch(`${base}/api/backend/auth/me`, {
      headers: { cookie: cookieStore.toString() },
    })
    if (!res.ok) return { profile: null, assessment: null }
    const u = await res.json()
    const profile = {
      full_name: u.full_name ?? null,
      email: u.email ?? null,
      avatar_url: null,
      age: null,
      gender: null,
      height_cm: null,
      weight_kg: null,
      fitness_goal: null,
      activity_level: null,
      dietary_preference: null,
    }
    const healthRes = await fetch(`${base}/api/backend/health`, {
      headers: { cookie: cookieStore.toString() },
    })
    const assessment = healthRes.ok ? await healthRes.json() : null
    return {
      profile,
      assessment,
      user: { id: userId, email: u.email },
    }
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
  return {
    profile,
    assessment,
    user: { id: userId },
  }
}

export default async function ProfilePage() {
  const user = await getDashboardUser()
  if (!user) return null

  const { profile, assessment } = await getProfileData(
    user.id,
    user.source
  )

  return (
    <ProfileView
      user={{ id: user.id, email: user.email }}
      profile={profile}
      assessment={assessment}
    />
  )
}
