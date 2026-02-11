import { getDashboardUser } from "@/lib/get-dashboard-user"
import { getBackendProfileAndAssessment } from "@/lib/backend-profile"
import { ProfileView } from "@/components/dashboard/profile-view"

async function getProfileData(userId: string, source: "supabase" | "backend") {
  if (source === "backend") {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const { profile, assessment } = await getBackendProfileAndAssessment(
      cookieStore.toString()
    )
    return {
      profile: profile ? { id: userId, ...profile } : null,
      assessment,
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
      source={user.source}
      profile={profile}
      assessment={assessment}
    />
  )
}
