"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  Dumbbell,
  Salad,
  Trophy,
  TrendingUp,
  ClipboardCheck,
  MessageCircle,
  ArrowRight,
  Droplets,
  Moon,
  Flame,
  Footprints,
  Heart,
} from "lucide-react"
import { TrackMetricModal } from "./track-metric-modal"

interface DashboardContentProps {
  profile: {
    full_name: string | null
    weight_kg: number | null
    fitness_goal: string | null
  } | null
  assessment: {
    bmi: number | null
    bmi_category: string | null
    sleep_hours: number | null
    water_intake_liters: number | null
    stress_level: string | null
  } | null
  workoutPlans: Array<{
    id: string
    name: string
    difficulty: string | null
    is_active: boolean
  }>
  progressRecords: Array<{
    id: string
    weight_kg: number | null
    calories_consumed: number | null
    calories_burned: number | null
    steps: number | null
    water_liters: number | null
    sleep_hours: number | null
    recorded_date: string
  }>
  achievements: Array<{
    id: string
    title: string
    icon: string | null
    points: number
  }>
}

export function DashboardContent({
  profile,
  assessment,
  workoutPlans,
  progressRecords,
  achievements,
}: DashboardContentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [trackType, setTrackType] = useState<{
    type: "water_liters" | "sleep_hours" | "weight_kg"
    title: string
    unit: string
    defaultValue?: number
  } | null>(null)

  const latestProgress = progressRecords?.[0]
  const hasAssessment = !!assessment
  const greeting = getGreeting()
  const displayName = profile?.full_name?.split(" ")[0] || "there"

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          {greeting}, {displayName}!
        </h2>
        <p className="mt-1 text-muted-foreground">
          {hasAssessment
            ? "Here's your wellness overview for today."
            : "Complete your health assessment to get personalized insights."}
        </p>
      </div>

      {/* Quick Action Banner */}
      {!hasAssessment && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary">
                <ClipboardCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Complete Your Health Assessment
                </p>
                <p className="text-sm text-muted-foreground">
                  Get your BMI analysis and personalized AI recommendations
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/dashboard/assessment">
                Start Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">BMI</p>
              <p className="font-display text-xl font-bold text-foreground">
                {assessment?.bmi ? Number(assessment.bmi).toFixed(1) : "--"}
              </p>
              <p className="text-xs text-muted-foreground">
                {assessment?.bmi_category || "Not assessed"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
              <Flame className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Calories Burned</p>
              <p className="font-display text-xl font-bold text-foreground">
                {latestProgress?.calories_burned || "--"}
              </p>
              <p className="text-xs text-muted-foreground">today</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-3/10">
              <Footprints className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Steps</p>
              <p className="font-display text-xl font-bold text-foreground">
                {latestProgress?.steps
                  ? latestProgress.steps.toLocaleString()
                  : "--"}
              </p>
              <p className="text-xs text-muted-foreground">
                {latestProgress?.steps
                  ? `${Math.round((latestProgress.steps / 10000) * 100)}% goal`
                  : "No data"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-4/10">
              <Trophy className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Achievements</p>
              <p className="font-display text-xl font-bold text-foreground">
                {achievements.length}
              </p>
              <p className="text-xs text-muted-foreground">unlocked</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wellness Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Droplets className="h-4 w-4 text-chart-3" />
              Water Intake
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-primary"
              onClick={() => {
                setTrackType({
                  type: "water_liters",
                  title: "Water Intake",
                  unit: "L",
                  defaultValue: latestProgress?.water_liters || 0,
                })
                setIsModalOpen(true)
              }}
            >
              + Track
            </Button>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl font-bold text-foreground">
              {latestProgress?.water_liters
                ? `${Number(latestProgress.water_liters).toFixed(1)}L`
                : assessment?.water_intake_liters
                  ? `${Number(assessment.water_intake_liters).toFixed(1)}L`
                  : "--"}
            </p>
            <Progress
              value={
                latestProgress?.water_liters
                  ? Math.min(
                    (Number(latestProgress.water_liters) / 3) * 100,
                    100
                  )
                  : 0
              }
              className="mt-3 h-2"
            />
            <p className="mt-2 text-xs text-muted-foreground">Goal: 3.0L / day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Moon className="h-4 w-4 text-chart-4" />
              Sleep
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-primary"
              onClick={() => {
                setTrackType({
                  type: "sleep_hours",
                  title: "Sleep",
                  unit: "h",
                  defaultValue: latestProgress?.sleep_hours || 0,
                })
                setIsModalOpen(true)
              }}
            >
              + Track
            </Button>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl font-bold text-foreground">
              {latestProgress?.sleep_hours
                ? `${Number(latestProgress.sleep_hours).toFixed(1)}h`
                : assessment?.sleep_hours
                  ? `${Number(assessment.sleep_hours).toFixed(1)}h`
                  : "--"}
            </p>
            <Progress
              value={
                latestProgress?.sleep_hours
                  ? Math.min(
                    (Number(latestProgress.sleep_hours) / 8) * 100,
                    100
                  )
                  : 0
              }
              className="mt-3 h-2"
            />
            <p className="mt-2 text-xs text-muted-foreground">Goal: 8h / night</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              Weight
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-primary"
              onClick={() => {
                setTrackType({
                  type: "weight_kg",
                  title: "Weight",
                  unit: "kg",
                  defaultValue: latestProgress?.weight_kg || 0,
                })
                setIsModalOpen(true)
              }}
            >
              + Track
            </Button>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl font-bold text-foreground">
              {latestProgress?.weight_kg
                ? `${Number(latestProgress.weight_kg).toFixed(1)} kg`
                : profile?.weight_kg
                  ? `${Number(profile.weight_kg).toFixed(1)} kg`
                  : "--"}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {profile?.fitness_goal
                ? `Goal: ${profile.fitness_goal}`
                : "Set your goal in profile"}
            </p>
          </CardContent>
        </Card>
      </div>

      {trackType && (
        <TrackMetricModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            // Usually we'd refresh the page or use a router hook
            window.location.reload()
          }}
          type={trackType.type}
          title={trackType.title}
          unit={trackType.unit}
          defaultValue={trackType.defaultValue}
        />
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="group cursor-pointer transition-colors hover:border-primary/30">
          <Link href="/dashboard/workouts">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Dumbbell className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Workout Plans</p>
                <p className="text-sm text-muted-foreground">
                  {workoutPlans.length > 0
                    ? `${workoutPlans.length} active plan${workoutPlans.length > 1 ? "s" : ""}`
                    : "Create your first plan"}
                </p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Link>
        </Card>

        <Card className="group cursor-pointer transition-colors hover:border-primary/30">
          <Link href="/dashboard/nutrition">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <Salad className="h-6 w-6 text-accent group-hover:text-accent-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Nutrition Plans</p>
                <p className="text-sm text-muted-foreground">
                  Manage your meal plans
                </p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Link>
        </Card>

        <Card className="group cursor-pointer transition-colors hover:border-primary/30">
          <Link href="/dashboard/coach">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-chart-4/10 transition-colors group-hover:bg-chart-4 group-hover:text-foreground">
                <MessageCircle className="h-6 w-6 text-chart-4 group-hover:text-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Chat with AROMI</p>
                <p className="text-sm text-muted-foreground">
                  Get AI health advice
                </p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Link>
        </Card>

        {/* Charity impact - dummy display */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Fitness With Purpose</p>
              <p className="text-sm text-muted-foreground">
                Your progress contributes to health charity initiatives
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}
