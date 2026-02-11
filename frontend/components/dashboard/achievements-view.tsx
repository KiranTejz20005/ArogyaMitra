"use client"

import React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Trophy,
  Flame,
  Footprints,
  Droplets,
  Dumbbell,
  Heart,
  Star,
  Zap,
  Target,
  Medal,
} from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string | null
  icon: string | null
  category: string | null
  points: number
  charity_amount: number
  unlocked: boolean
  unlocked_at: string | null
}

interface AchievementsViewProps {
  userId: string
  achievements: Achievement[]
  totalWorkouts: number
}

const defaultAchievements = [
  {
    title: "First Steps",
    description: "Log your first progress entry",
    icon: "footprints",
    category: "progress",
    points: 10,
    charity: 5,
    threshold: 1,
    metric: "entries",
  },
  {
    title: "Week Warrior",
    description: "Log progress for 7 consecutive days",
    icon: "flame",
    category: "consistency",
    points: 50,
    charity: 25,
    threshold: 7,
    metric: "entries",
  },
  {
    title: "Hydration Hero",
    description: "Drink 3L+ water for 5 days",
    icon: "droplets",
    category: "nutrition",
    points: 30,
    charity: 15,
    threshold: 5,
    metric: "hydration",
  },
  {
    title: "Iron Will",
    description: "Complete 10 workout sessions",
    icon: "dumbbell",
    category: "fitness",
    points: 75,
    charity: 50,
    threshold: 10,
    metric: "workouts",
  },
  {
    title: "Health Champion",
    description: "Complete your health assessment",
    icon: "heart",
    category: "health",
    points: 25,
    charity: 10,
    threshold: 1,
    metric: "assessment",
  },
  {
    title: "10K Steps Club",
    description: "Hit 10,000 steps in a single day",
    icon: "target",
    category: "fitness",
    points: 40,
    charity: 20,
    threshold: 10000,
    metric: "steps",
  },
  {
    title: "Nutrition Guru",
    description: "Follow your meal plan for 7 days",
    icon: "star",
    category: "nutrition",
    points: 60,
    charity: 30,
    threshold: 7,
    metric: "meals",
  },
  {
    title: "Transformation Master",
    description: "Reach your target weight goal",
    icon: "zap",
    category: "progress",
    points: 100,
    charity: 100,
    threshold: 1,
    metric: "goal",
  },
]

const iconMap: Record<string, React.ElementType> = {
  footprints: Footprints,
  flame: Flame,
  droplets: Droplets,
  dumbbell: Dumbbell,
  heart: Heart,
  target: Target,
  star: Star,
  zap: Zap,
  medal: Medal,
  trophy: Trophy,
}

const categoryColors: Record<string, string> = {
  progress: "bg-chart-1/10 text-chart-1",
  consistency: "bg-accent/10 text-accent-foreground",
  nutrition: "bg-chart-3/10 text-chart-3",
  fitness: "bg-primary/10 text-primary",
  health: "bg-destructive/10 text-destructive",
}

export function AchievementsView({
  userId,
  achievements,
  totalWorkouts,
}: AchievementsViewProps) {
  const [seededAchievements, setSeededAchievements] = useState<Achievement[]>(achievements)

  useEffect(() => {
    async function seedIfEmpty() {
      if (achievements.length > 0) return
      const supabase = createClient()
      const toInsert = defaultAchievements.map((a) => ({
        user_id: userId,
        title: a.title,
        description: a.description,
        icon: a.icon,
        category: a.category,
        points: a.points,
        charity_amount: a.charity,
        unlocked: false,
      }))
      const { data } = await supabase
        .from("achievements")
        .insert(toInsert)
        .select()
      if (data) setSeededAchievements(data)
    }
    seedIfEmpty()
  }, [achievements, userId])

  const displayAchievements = seededAchievements.length > 0 ? seededAchievements : []
  const unlockedCount = displayAchievements.filter((a) => a.unlocked).length
  const totalPoints = displayAchievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + (a.points || 0), 0)
  const totalCharity = displayAchievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + Number(a.charity_amount || 0), 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">
          Achievements
        </h2>
        <p className="text-sm text-muted-foreground">
          Earn points and contribute to charity through your fitness journey
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {unlockedCount}/{displayAchievements.length}
              </p>
              <p className="text-sm text-muted-foreground">Unlocked</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <Star className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalPoints}</p>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
              <Heart className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {totalCharity > 0 ? `Rs. ${totalCharity}` : "Rs. 0"}
              </p>
              <p className="text-sm text-muted-foreground">Charity Earned</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Overall Progress</p>
            <p className="text-sm text-muted-foreground">
              {displayAchievements.length > 0
                ? Math.round((unlockedCount / displayAchievements.length) * 100)
                : 0}
              %
            </p>
          </div>
          <Progress
            value={
              displayAchievements.length > 0
                ? (unlockedCount / displayAchievements.length) * 100
                : 0
            }
            className="mt-2 h-2"
          />
        </CardContent>
      </Card>

      {/* Achievement Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayAchievements.map((achievement) => {
          const IconComp = iconMap[achievement.icon || "trophy"] || Trophy
          const colorClass =
            categoryColors[achievement.category || "progress"] ||
            "bg-muted text-muted-foreground"

          return (
            <Card
              key={achievement.id}
              className={`transition-all ${
                achievement.unlocked
                  ? "border-primary/30 shadow-md"
                  : "opacity-70"
              }`}
            >
              <CardHeader className="flex flex-row items-start gap-4 pb-2">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    achievement.unlocked
                      ? "bg-primary/10"
                      : "bg-muted"
                  }`}
                >
                  <IconComp
                    className={`h-6 w-6 ${
                      achievement.unlocked
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base font-semibold text-foreground">
                    {achievement.title}
                  </CardTitle>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between pt-0">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={colorClass}
                  >
                    {achievement.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {achievement.points} pts
                  </span>
                </div>
                {achievement.unlocked ? (
                  <Badge className="bg-primary text-primary-foreground">
                    Unlocked
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Locked
                  </Badge>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {displayAchievements.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Trophy className="h-7 w-7 text-primary" />
            </div>
            <p className="font-medium text-foreground">Loading achievements...</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your badges will appear here momentarily
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
