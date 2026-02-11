import { NextRequest, NextResponse } from "next/server"
import { getTokenFromCookie } from "@/lib/backend-api"
import { API_CONFIG } from "@/config/api"

export async function GET(req: NextRequest) {
  const token = getTokenFromCookie(req.headers.get("cookie") ?? null)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const res = await fetch(`${API_CONFIG.getBackendUrl()}/workouts/plans`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return NextResponse.json({ plan: null })
  const data = await res.json()
  const plan = Array.isArray(data) && data.length > 0 ? data[0] : null
  return NextResponse.json({ plan })
}
