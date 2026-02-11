"use client"

import React from "react"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getStoredAvatarUrl, AVATAR_UPDATED_EVENT } from "@/lib/avatar-store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  ClipboardCheck,
  Dumbbell,
  Salad,
  TrendingUp,
  Trophy,
  MessageCircle,
  UserCircle,
  LogOut,
  Menu,
  X,
  Video,
} from "lucide-react"
import { useState, useEffect } from "react"
import { FloatingAromi } from "@/components/dashboard/floating-aromi"

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
}

interface DashboardUser {
  id: string
  email?: string
}

interface DashboardShellProps {
  user: DashboardUser
  profile: Profile | null
  children: React.ReactNode
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/assessment", label: "Health Assessment", icon: ClipboardCheck },
  { href: "/dashboard/workouts", label: "Workout Plans", icon: Dumbbell },
  { href: "/dashboard/nutrition", label: "Nutrition", icon: Salad },
  { href: "/dashboard/progress", label: "Progress", icon: TrendingUp },
  { href: "/dashboard/achievements", label: "Achievements", icon: Trophy },
  { href: "/videos", label: "YouTube Videos", icon: Video },
  { href: "/dashboard/coach", label: "AROMI Coach", icon: MessageCircle },
  { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
]

export function DashboardShell({ user, profile, children }: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => getStoredAvatarUrl())

  useEffect(() => {
    const handler = () => setAvatarUrl(getStoredAvatarUrl())
    window.addEventListener(AVATAR_UPDATED_EVENT, handler)
    return () => window.removeEventListener(AVATAR_UPDATED_EVENT, handler)
  }, [])

  const displayName = profile?.full_name || user.email?.split("@")[0] || "User"
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-lg object-contain" />
          <span className="font-display text-lg font-bold text-card-foreground">
            ArogyaMitra
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="px-3 py-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Daily Goals
              </span>
            </div>
            <div className="mt-3 space-y-3">
              <div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Water Intake</span>
                  <span>Goal: 3.0L</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-primary/10">
                  <div className="h-full w-[65%] rounded-full bg-primary" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Sleep</span>
                  <span>Goal: 8.0h</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-chart-4/10">
                  <div className="h-full w-[80%] rounded-full bg-chart-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-card-foreground">
                {displayName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={() => { }}
            role="button"
            tabIndex={-1}
            aria-label="Close sidebar"
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-border bg-card">
            <div className="flex h-16 items-center justify-between border-b border-border px-6">
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-lg object-contain" />
                <span className="font-display text-lg font-bold text-card-foreground">
                  ArogyaMitra
                </span>
              </div>
              <button onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <div className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-md p-2 text-muted-foreground hover:text-foreground lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-semibold text-card-foreground">
              {navItems.find(
                (item) =>
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href))
              )?.label || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
                    <AvatarFallback className="bg-primary/10 text-xs text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {/* Floating AROMI Assistant */}
      <FloatingAromi profile={profile} />
    </div>
  )
}
