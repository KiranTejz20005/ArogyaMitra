import { NextRequest, NextResponse } from "next/server"
import { getTokenFromCookie } from "@/lib/backend-api"
import { API_CONFIG } from "@/config/api"

export async function GET(req: NextRequest) {
  const token = getTokenFromCookie(req.headers.get("cookie") ?? null)
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  const res = await fetch(`${API_CONFIG.getBackendUrl()}/nutrition/plans`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return NextResponse.json(await res.json().catch(() => []), { status: res.status })
  const data = await res.json()
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const token = getTokenFromCookie(req.headers.get("cookie") ?? null)
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  const planId = req.nextUrl.searchParams.get("id")
  if (!planId) return NextResponse.json({ error: "plan id required" }, { status: 400 })
  const res = await fetch(`${API_CONFIG.getBackendUrl()}/nutrition/plans/${planId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return NextResponse.json(await res.json().catch(() => ({})), { status: res.status })
  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  const token = getTokenFromCookie(req.headers.get("cookie") ?? null)
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  let body: { name: string; description?: string; daily_calories?: number; protein_grams?: number; carbs_grams?: number; fat_grams?: number; dietary_type?: string; meals?: Array<{ name: string; meal_type?: string; time?: string; calories?: number; protein_g?: number; carbs_g?: number; fat_g?: number; ingredients?: string[]; day_of_week?: string }> } = await req.json().catch(() => ({}))
  if (!body.name) return NextResponse.json({ error: "name required" }, { status: 400 })
  const planRes = await fetch(`${API_CONFIG.getBackendUrl()}/nutrition/plans`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: body.name,
      description: body.description ?? null,
      daily_calories: body.daily_calories ?? null,
      protein_grams: body.protein_grams ?? null,
      carbs_grams: body.carbs_grams ?? null,
      fat_grams: body.fat_grams ?? null,
      dietary_type: body.dietary_type ?? null,
      is_active: true,
    }),
  })
  if (!planRes.ok) return NextResponse.json(await planRes.json().catch(() => ({})), { status: planRes.status })
  const plan = await planRes.json()
  const planId = plan.id
  const meals = body.meals ?? []
  if (meals.length > 0) {
    const mealsPayload = meals.map((m: { name: string; meal_type?: string; time?: string; calories?: number; protein_g?: number; carbs_g?: number; fat_g?: number; ingredients?: string[]; day_of_week?: string }) => ({
      name: m.name,
      meal_type: m.meal_type ?? null,
      time: m.time ?? null,
      calories: m.calories ?? null,
      protein_g: m.protein_g ?? null,
      carbs_g: m.carbs_g ?? null,
      fat_g: m.fat_g ?? null,
      ingredients: m.ingredients ?? null,
      day_of_week: m.day_of_week ?? null,
    }))
    const mealsRes = await fetch(`${API_CONFIG.getBackendUrl()}/nutrition/plans/${planId}/meals`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(mealsPayload),
    })
    if (!mealsRes.ok) return NextResponse.json(await mealsRes.json().catch(() => ({})), { status: mealsRes.status })
  }
  return NextResponse.json({ id: planId, name: plan.name })
}
