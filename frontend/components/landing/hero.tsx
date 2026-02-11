"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Activity, Brain, UserCircle, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export function Hero() {
  const router = useRouter()
  const [guestLoading, setGuestLoading] = useState(false)

  const handleGuestMode = async () => {
    setGuestLoading(true)
    try {
      const res = await fetch("/api/auth/guest", { method: "POST" })
      if (res.ok) {
        router.push("/dashboard")
        router.refresh()
        return
      }
      router.push("/")
      router.refresh()
    } catch {
      router.push("/")
      router.refresh()
    } finally {
      setGuestLoading(false)
    }
  }
  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-32">
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/4 translate-y-1/4 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered Health Companion</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-4xl text-balance font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl"
          >
            Your Personal Path to{" "}
            <span className="text-primary">Holistic Wellness</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl"
          >
            ArogyaMitra combines AI coaching, personalized workout plans, and
            smart nutrition guidance to help you achieve your fitness goals.
            Meet AROMI, your always-on health AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Button size="lg" className="gap-2 px-8" asChild>
              <Link href="/auth/sign-up">
                Start Your Journey
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 px-8 bg-transparent" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-4 flex flex-col items-center gap-2"
          >
            <p className="text-sm text-muted-foreground">Or skip sign up — try the app as guest</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={guestLoading}
              onClick={handleGuestMode}
              className="gap-2"
            >
              {guestLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserCircle className="h-4 w-4" />
              )}
              Guest mode
            </Button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="font-display text-3xl font-bold text-foreground">
                10K+
              </span>
              <span className="text-sm text-muted-foreground">Active Users</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col items-center gap-1">
              <span className="font-display text-3xl font-bold text-foreground">
                500+
              </span>
              <span className="text-sm text-muted-foreground">Workout Plans</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col items-center gap-1">
              <span className="font-display text-3xl font-bold text-foreground">
                24/7
              </span>
              <span className="text-sm text-muted-foreground">AI Coaching</span>
            </div>
          </motion.div>

          {/* Preview cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-3"
          >
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">Smart Workouts</p>
                <p className="text-xs text-muted-foreground">Adapted to your level</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">Nutrition Plans</p>
                <p className="text-xs text-muted-foreground">Indian cuisine focused</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">AROMI AI Coach</p>
                <p className="text-xs text-muted-foreground">Your personal guide</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
