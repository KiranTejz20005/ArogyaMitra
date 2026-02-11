import { getDashboardUser } from "@/lib/get-dashboard-user"
import { ProgressView } from "@/components/dashboard/progress-view"

async function getProgressData(userId: string, source: "supabase" | "backend") {
  if (source === "backend") {
    const { cookies } = await import("next/headers")
    const { getAppBaseUrl } = await import("@/lib/app-base-url")
    const cookieStore = await cookies()
    const res = await fetch(`${getAppBaseUrl()}/api/backend/progress`, {
      headers: { cookie: cookieStore.toString() },
    })
    if (!res.ok) return []
    const entries = await res.json()
    return (Array.isArray(entries) ? entries : []).map(
      (e: { id: number; entry_type: string; value?: number; recorded_at?: string }) => ({
        id: String(e.id),
        weight_kg: e.entry_type === "weight" ? e.value : null,
        body_fat_percentage: null,
        calories_consumed: null,
        calories_burned: null,
        steps: null,
        water_liters: null,
        sleep_hours: null,
        mood: null,
        notes: null,
        recorded_date: e.recorded_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      })
    )
  }
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  const { data } = await supabase
    .from("progress_records")
    .select("*")
    .eq("user_id", userId)
    .order("recorded_date", { ascending: true })
  return (data ?? []).map((r) => ({
    id: r.id,
    weight_kg: r.weight_kg,
    body_fat_percentage: r.body_fat_percentage,
    calories_consumed: r.calories_consumed,
    calories_burned: r.calories_burned,
    steps: r.steps,
    water_liters: r.water_liters,
    sleep_hours: r.sleep_hours,
    mood: r.mood,
    notes: r.notes,
    recorded_date: r.recorded_date,
  }))
}

export default async function ProgressPage() {
  const user = await getDashboardUser()
  if (!user) return null

  const records = await getProgressData(user.id, user.source)

  return <ProgressView userId={user.id} records={records} />
}
