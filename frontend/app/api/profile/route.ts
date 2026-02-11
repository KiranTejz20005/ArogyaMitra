import { NextRequest, NextResponse } from "next/server"
import { getTokenFromCookie } from "@/lib/backend-api"
import { API_CONFIG } from "@/config/api"

/** PATCH: update profile (full_name) and health assessment for backend users */
export async function PATCH(req: NextRequest) {
  const token = getTokenFromCookie(req.headers.get("cookie") ?? null)
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const base = API_CONFIG.getBackendUrl()

  const fullName = body.full_name as string | undefined
  const assessment = body.assessment as {
    age?: number | null
    gender?: string | null
    height_cm?: number | null
    weight_kg?: number | null
    fitness_goal?: string | null
    activity_level?: string | null
    dietary_preference?: string | null
  } | undefined

  try {
    if (fullName !== undefined) {
      const meRes = await fetch(`${base}/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ full_name: fullName || null }),
      })
      if (!meRes.ok) {
        const err = await meRes.json().catch(() => ({}))
        return NextResponse.json(
          { error: (err.detail as string) || "Failed to update profile" },
          { status: meRes.status }
        )
      }
    }

    if (assessment && Object.keys(assessment).length > 0) {
      const healthRes = await fetch(`${base}/health/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(assessment),
      })
      if (!healthRes.ok) {
        const err = await healthRes.json().catch(() => ({}))
        return NextResponse.json(
          { error: (err.detail as string) || "Failed to update health" },
          { status: healthRes.status }
        )
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Profile save error:", e)
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 })
  }
}
