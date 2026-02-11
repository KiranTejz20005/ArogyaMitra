import { getDashboardUser } from "@/lib/get-dashboard-user"
import { getBackendProfileAndAssessment } from "@/lib/backend-profile"
import { CoachView } from "@/components/dashboard/coach-view"

async function getCoachData(userId: string, source: "supabase" | "backend") {
  if (source === "backend") {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const { profile, assessment } = await getBackendProfileAndAssessment(
      cookieStore.toString()
    )
    return {
      profile,
      assessment,
      chatSessions: [] as unknown[],
    }
  }
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  const [{ data: profile }, { data: assessment }, { data: chatSessions }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase
        .from("health_assessments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false }),
    ])
  return {
    profile,
    assessment,
    chatSessions: chatSessions ?? [],
  }
}

export default async function CoachPage() {
  const user = await getDashboardUser()
  if (!user) return null

  const { profile, assessment, chatSessions } = await getCoachData(
    user.id,
    user.source
  )

  return (
    <CoachView
      userId={user.id}
      profile={profile}
      assessment={assessment}
      chatSessions={chatSessions}
    />
  )
}
