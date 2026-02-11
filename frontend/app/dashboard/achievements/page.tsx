import { getDashboardUser } from "@/lib/get-dashboard-user"
import { AchievementsView } from "@/components/dashboard/achievements-view"

async function getAchievementsData(userId: string, source: "supabase" | "backend") {
  if (source === "backend") {
    return { achievements: [], totalWorkouts: 0 }
  }
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  const [{ data: achievements }, { data: progressRecords }] = await Promise.all([
    supabase
      .from("achievements")
      .select("*")
      .eq("user_id", userId)
      .order("earned_at", { ascending: false }),
    supabase.from("progress_records").select("id").eq("user_id", userId),
  ])
  return {
    achievements: achievements ?? [],
    totalWorkouts: progressRecords?.length ?? 0,
  }
}

export default async function AchievementsPage() {
  const user = await getDashboardUser()
  if (!user) return null

  const { achievements, totalWorkouts } = await getAchievementsData(
    user.id,
    user.source
  )

  return (
    <AchievementsView
      userId={user.id}
      achievements={achievements}
      totalWorkouts={totalWorkouts}
    />
  )
}
