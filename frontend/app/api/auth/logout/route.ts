import { NextResponse } from "next/server"
import { TOKEN_COOKIE } from "@/lib/backend-api"

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(TOKEN_COOKIE, "", { path: "/", maxAge: 0 })
  return res
}
