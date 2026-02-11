import { NextRequest, NextResponse } from "next/server"
import { getTokenFromCookie } from "@/lib/backend-api"
import { API_CONFIG } from "@/config/api"

export async function GET(req: NextRequest) {
    const token = getTokenFromCookie(req.headers.get("cookie") ?? null)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const res = await fetch(`${API_CONFIG.getBackendUrl()}/progress/`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return NextResponse.json({ history: [] })
    return NextResponse.json(await res.json())
}

export async function POST(req: NextRequest) {
    const token = getTokenFromCookie(req.headers.get("cookie") ?? null)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const body = await req.json()
    const res = await fetch(`${API_CONFIG.getBackendUrl()}/progress/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    })
    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Failed to update progress" }))
        return NextResponse.json({ error: error.detail || "Failed to update progress" }, { status: res.status })
    }
    return NextResponse.json(await res.json())
}
