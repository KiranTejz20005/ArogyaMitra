/**
 * Get the current dashboard user from either Supabase or backend auth.
 * The app uses backend JWT auth (arogyamitra_token). Some pages were built for Supabase.
 * This helper returns the effective user so pages can render content.
 */
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { getAppBaseUrl } from "@/lib/app-base-url"

export type DashboardUser =
  | { source: "supabase"; id: string; email?: string }
  | { source: "backend"; id: string; email?: string; full_name?: string | null }
  | null

export async function getDashboardUser(): Promise<DashboardUser> {
  // Try Supabase first (for users who signed up via Supabase)
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      return { source: "supabase", id: user.id, email: user.email ?? undefined }
    }
  } catch {
    // Supabase not configured or failed
  }

  // Fall back to backend auth (arogyamitra_token)
  try {
    const cookieStore = await cookies()
    const res = await fetch(`${getAppBaseUrl()}/api/backend/auth/me`, {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    })
    if (res.ok) {
      const u = (await res.json()) as {
        id: number
        email?: string
        full_name?: string | null
      }
      return {
        source: "backend",
        id: String(u.id),
        email: u.email,
        full_name: u.full_name,
      }
    }
  } catch {
    // Backend unreachable
  }

  return null
}
