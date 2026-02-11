import React from "react"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getAppBaseUrl } from "@/lib/app-base-url"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get("arogyamitra_token")?.value
  if (!token) redirect("/auth/login")

  let user: { id: string; email?: string } | null = null
  try {
    const res = await fetch(`${getAppBaseUrl()}/api/backend/auth/me`, {
      headers: { cookie: cookieStore.toString() },
    })
    if (res.ok) user = await res.json()
  } catch {
    // ignore
  }
  if (!user) redirect("/auth/login")

  const uid = typeof user.id === "number" ? String(user.id) : user.id
  const profile = {
    id: uid,
    full_name: (user as { full_name?: string | null }).full_name ?? null,
    avatar_url: null,
  }

  return (
    <DashboardShell
      user={{ id: uid, email: (user as { email?: string }).email }}
      profile={profile}
    >
      {children}
    </DashboardShell>
  )
}
