"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, UserCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Login failed")
        setLoading(false)
        return
      }
      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("Login failed")
      setLoading(false)
    }
  }

  const handleGuestMode = async () => {
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/guest", { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        router.push("/dashboard")
        router.refresh()
        return
      }
      // Backend unreachable or error: still take user to home screen (landing)
      router.push("/")
      router.refresh()
    } catch {
      // Network or other error: still take user to home screen
      router.push("/")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-primary p-10 lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="ArogyaMitra" width={36} height={36} className="h-9 w-9 rounded-lg object-contain" />
          <span className="font-display text-xl font-bold text-primary-foreground">
            ArogyaMitra
          </span>
        </Link>
        <div>
          <h2 className="max-w-md font-display text-3xl font-bold text-primary-foreground">
            Welcome back to your wellness journey
          </h2>
          <p className="mt-3 max-w-sm text-primary-foreground/70">
            Log in to continue tracking your progress, follow your personalized
            plans, and chat with AROMI.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/50">
          &copy; {new Date().getFullYear()} ArogyaMitra
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="ArogyaMitra" width={36} height={36} className="h-9 w-9 rounded-lg object-contain" />
              <span className="font-display text-xl font-bold text-foreground">
                ArogyaMitra
              </span>
            </Link>
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground">Log In</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>

          <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={loading} className="mt-2 w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={loading}
              className="w-full"
              onClick={handleGuestMode}
            >
              <UserCircle className="mr-2 h-4 w-4" />
              Guest mode
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
