import { NextRequest, NextResponse } from "next/server"
import { loginBackend, TOKEN_COOKIE } from "@/lib/backend-api"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }
    const data = await loginBackend(email, password)
    const res = NextResponse.json({ ok: true })
    res.cookies.set(TOKEN_COOKIE, data.access_token, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    })
    return res
  } catch (e) {
    const message = e instanceof Error ? e.message : "Login failed"
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
