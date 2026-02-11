import { NextRequest, NextResponse } from "next/server"
import { getMeBackend, getTokenFromCookie } from "@/lib/backend-api"

export async function GET(req: NextRequest) {
  const token = getTokenFromCookie(req.headers.get("cookie") ?? null)
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  const user = await getMeBackend(token)
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  return NextResponse.json(user)
}
