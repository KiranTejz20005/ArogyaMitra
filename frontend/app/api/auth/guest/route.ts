import { NextResponse } from "next/server"
import { guestLoginBackend, TOKEN_COOKIE } from "@/lib/backend-api"

export async function POST() {
  try {
    const data = await guestLoginBackend()
    const res = NextResponse.json({ ok: true })
    res.cookies.set(TOKEN_COOKIE, data.access_token, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    })
    return res
  } catch (e) {
    const message = e instanceof Error ? e.message : "Guest login failed"
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
