import { NextRequest, NextResponse } from "next/server"
import { getMeBackend, getTokenFromCookie } from "@/lib/backend-api"

export async function GET(req: NextRequest) {
  const token = getTokenFromCookie(req.headers.get("cookie") ?? null)
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  try {
    const user = await getMeBackend(token)
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    return NextResponse.json(user)
  } catch (err) {
    console.error("Backend auth/me request failed:", err)
    return NextResponse.json(
      { error: "Backend unavailable. Check that the API URL is correct and the backend is running." },
      { status: 503 }
    )
  }
}
