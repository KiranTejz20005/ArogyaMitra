import { NextRequest, NextResponse } from "next/server"
import { getTokenFromCookie } from "@/lib/backend-api"
import { API_CONFIG } from "@/config/api"

export async function GET(req: NextRequest) {
  const token = getTokenFromCookie(req.headers.get("cookie") ?? null)
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  const res = await fetch(`${API_CONFIG.getBackendUrl()}/workouts/plans`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return NextResponse.json(await res.json().catch(() => ({})), { status: res.status })
  const data = await res.json()
  return NextResponse.json(data)
}
