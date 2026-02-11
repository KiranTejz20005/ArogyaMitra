import { NextRequest, NextResponse } from "next/server"
import { getTokenFromCookie } from "@/lib/backend-api"
import { API_CONFIG } from "@/config/api"

export async function POST(req: NextRequest) {
  const token = getTokenFromCookie(req.headers.get("cookie") ?? null)
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const res = await fetch(`${API_CONFIG.getBackendUrl()}/nutrition/meals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: body.name ?? "",
      meal_type: body.meal_type ?? null,
      calories: body.calories ?? null,
      protein: body.protein ?? body.protein_grams ?? null,
      carbs: body.carbs ?? body.carbs_grams ?? null,
      fat: body.fat ?? body.fat_grams ?? null,
      ingredients: body.ingredients ?? null,
      day_of_week: body.day_of_week ?? null,
      nutrition_plan_id: body.nutrition_plan_id ?? null,
    }),
  })
  if (!res.ok) return NextResponse.json(await res.json().catch(() => ({})), { status: res.status })
  const data = await res.json()
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const token = getTokenFromCookie(req.headers.get("cookie") ?? null)
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  const mealId = req.nextUrl.searchParams.get("id")
  if (!mealId) return NextResponse.json({ error: "meal id required" }, { status: 400 })
  const res = await fetch(`${API_CONFIG.getBackendUrl()}/nutrition/meals/${mealId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return NextResponse.json(await res.json().catch(() => ({})), { status: res.status })
  return NextResponse.json({ ok: true })
}
