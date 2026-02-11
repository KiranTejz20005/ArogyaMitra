"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dumbbell,
  Loader2,
  Play,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  Zap,
  CheckCircle2,
  Circle,
  Timer,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

interface Exercise {
  id?: string | null
  name: string
  sets: number
  reps: string
  rest_seconds: number
  difficulty: string
  instructions: string
  youtube_url?: string | null
}

interface DailyWorkout {
  day: number
  day_name: string
  focus: string
  total_duration: number
  recommended_time: string
  warmup: string
  exercises: Exercise[]
  cooldown: string
  status?: "complete" | "incomplete"
  completed_exercises?: string[]
}

interface WorkoutPlan {
  id: string
  name: string
  plan_data?: {
    daily_workouts: DailyWorkout[]
    weekly_summary?: string
    tips?: string[]
  }
}

interface WorkoutPlansViewProps {
  userId: string
  workoutPlans: WorkoutPlan[]
  profile: { fitness_goal: string | null; activity_level: string | null } | null
}

function ConfettiCelebration() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"][
      Math.floor(Math.random() * 5)
    ],
  }))
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute h-2 w-2 animate-ping rounded-full"
          style={{
            left: `${p.left}%`,
            top: "50%",
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export function WorkoutPlansView({
  userId,
  workoutPlans,
  profile,
}: WorkoutPlansViewProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [todayWorkout, setTodayWorkout] = useState<{
    workout: (DailyWorkout & { plan_id: string }) | null
    day_name: string
    status?: string
    message?: string
  } | null>(null)
  const [fullPlan, setFullPlan] = useState<WorkoutPlan | null>(null)
  const [activeVideo, setActiveVideo] = useState<{
    url: string
    exercise: Exercise
  } | null>(null)
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(
    new Set()
  )
  const [completionModalOpen, setCompletionModalOpen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [expandedDay, setExpandedDay] = useState<number | null>(null)
  const [workoutTimer, setWorkoutTimer] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [setsCompleted, setSetsCompleted] = useState(0)
  const [repsInput, setRepsInput] = useState("")
  const [genStatus, setGenStatus] = useState("Preparing your plan...")

  const fetchToday = useCallback(async () => {
    const res = await fetch("/api/workouts/today")
    const data = await res.json()
    if (data.fallback) toast.warning("API failed to retrieve. Showing sample data.")
    setTodayWorkout(data)
    if (data.workout?.completed_exercises) {
      setCompletedExercises(new Set(data.workout.completed_exercises))
    }
  }, [])

  const fetchPlan = useCallback(async () => {
    const res = await fetch("/api/workouts")
    const data = await res.json()
    if (data.fallback) toast.warning("API failed to retrieve. Showing sample data.")
    setFullPlan(data.plan)
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([fetchToday(), fetchPlan()])
      setLoading(false)
    }
    load()
  }, [fetchToday, fetchPlan])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    if (timerRunning) {
      interval = setInterval(() => setWorkoutTimer((t) => t + 1), 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerRunning])

  const handleGeneratePlan = async () => {
    setGenerating(true)
    setGenStatus("Analyzing your fitness profile...")

    const messages = [
      "Analyzing your fitness profile...",
      "Optimizing workout intensity...",
      "Structuring your 7-day schedule...",
      "Selecting best exercises for your goals...",
      "Finalizing your personalized plan..."
    ]
    let msgIdx = 0
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % messages.length
      setGenStatus(messages[msgIdx])
    }, 2500)

    try {
      const res = await fetch("/api/workouts/generate", { method: "POST" })
      const data = await res.json()
      clearInterval(interval)

      if (data.fallback) {
        // Immediately set the fallback plan so the UI updates without another fetch
        if (data.plan) {
          setFullPlan(data.plan)
          // Also set today's workout from the plan if possible
          const today = new Date()
          const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][today.getDay()]
          const todayWorkoutData = data.plan.plan_data?.daily_workouts?.find(
            (d: any) => d.day_name?.toLowerCase() === dayName.toLowerCase()
          )
          if (todayWorkoutData) {
            setTodayWorkout({
              workout: { ...todayWorkoutData, plan_id: data.plan.id },
              day_name: dayName
            })
          }
        }
        toast.info("We've prepared an optimized workout plan for you!")
      } else if (data.error) {
        toast.error(data.error)
        setGenerating(false)
        return
      } else {
        toast.success("Your 7-day workout plan has been generated!")
        await Promise.all([fetchToday(), fetchPlan()])
      }
      router.refresh()
    } catch (e) {
      clearInterval(interval)
      console.error(e)
      toast.error("Failed to generate plan. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  const handleCompleteExercise = async (exercise: Exercise) => {
    if (!exercise.id) return
    const name = exercise.name
    setCompletedExercises((prev) => new Set([...prev, name]))

    const workout = todayWorkout?.workout
    if (!workout) return

    const allDone =
      workout.exercises?.every((e) =>
        new Set([...completedExercises, name]).has(e.name)
      ) ?? false

    try {
      const res = await fetch(`/api/workouts/complete/${exercise.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sets_completed: exercise.sets,
          reps_completed: parseInt(repsInput) || 0,
          duration_minutes: Math.floor(workoutTimer / 60),
          calories_burned: Math.round(workout.total_duration * 5),
        }),
      })
      if (res.ok) await fetchToday()
    } catch (e) {
      console.error(e)
    }

    if (allDone) {
      setShowConfetti(true)
      setCompletionModalOpen(true)
      setTimeout(() => setShowConfetti(false), 2000)
    }
  }

  const handleToggleComplete = (e: React.MouseEvent, exercise: Exercise) => {
    e.stopPropagation()
    const name = exercise.name
    if (completedExercises.has(name)) return
    handleCompleteExercise(exercise)
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const dailyWorkouts = fullPlan?.plan_data?.daily_workouts ?? []
  const workout = todayWorkout?.workout
  const allExercisesComplete =
    workout &&
    workout.exercises?.length &&
    workout.exercises.every((e) => completedExercises.has(e.name))

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Workout Plans
          </h2>
          <p className="text-sm text-muted-foreground">
            AI-generated 7-day plans tailored to you
          </p>
        </div>
        {!fullPlan && (
          <Button
            onClick={handleGeneratePlan}
            disabled={generating}
            className="relative overflow-hidden"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>{genStatus}</span>
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Generate AI Plan
              </>
            )}
          </Button>
        )}
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-6">
          {!workout && todayWorkout?.status === "rest_day" ? (
            <Card>
              <CardContent className="flex flex-col items-center py-16">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <p className="font-medium text-foreground">Rest Day!</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {todayWorkout.message ?? "Take it easy and recover."}
                </p>
              </CardContent>
            </Card>
          ) : !workout ? (
            <Card>
              <CardContent className="flex flex-col items-center py-16">
                <Dumbbell className="mb-4 h-14 w-14 text-muted-foreground" />
                <p className="font-medium text-foreground">No workout for today</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Generate an AI plan to get started
                </p>
                <Button
                  className="mt-4"
                  onClick={handleGeneratePlan}
                  disabled={generating}
                >
                  {generating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Generate Plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-6">
                <h3 className="font-display text-2xl font-bold">
                  Today&apos;s Workout 💪
                </h3>
                <p className="mt-1 text-lg text-muted-foreground">
                  {workout.focus}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {workout.total_duration} min
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Flame className="h-3 w-3" />
                    {workout.exercises?.length ?? 0} exercises
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    ⏰ Recommended: {workout.recommended_time}
                  </Badge>
                  <Badge
                    variant={workout.status === "complete" ? "default" : "secondary"}
                    className={
                      workout.status === "complete"
                        ? "bg-primary"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {workout.status === "complete" ? "Complete" : "Incomplete"}
                  </Badge>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    🔥 Warm-up
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{workout.warmup}</p>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h4 className="font-semibold">Exercises</h4>
                {workout.exercises?.map((ex) => (
                  <Collapsible key={ex.name}>
                    <Card>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={(e) => handleToggleComplete(e, ex)}
                                className="shrink-0"
                              >
                                {completedExercises.has(ex.name) ? (
                                  <CheckCircle2 className="h-6 w-6 text-primary" />
                                ) : (
                                  <Circle className="h-6 w-6 text-muted-foreground hover:text-primary" />
                                )}
                              </button>
                              <div>
                                <p className="font-medium">{ex.name}</p>
                                <div className="mt-1 flex gap-2">
                                  <Badge
                                    variant="outline"
                                    className="text-xs capitalize"
                                  >
                                    {ex.difficulty}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {ex.sets} sets × {ex.reps} reps
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Rest: {ex.rest_seconds}s
                                  </span>
                                </div>
                              </div>
                            </div>
                            <ChevronDown className="h-4 w-4 shrink-0" />
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <p className="mb-4 text-sm text-muted-foreground">
                            {ex.instructions}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              ex.youtube_url &&
                              setActiveVideo({
                                url: ex.youtube_url,
                                exercise: ex,
                              })
                            }
                            disabled={!ex.youtube_url}
                          >
                            <Play className="mr-2 h-4 w-4" /> Play Video
                          </Button>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    ❄️ Cool-down
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{workout.cooldown}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="week" className="mt-6">
          {dailyWorkouts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-16">
                <Dumbbell className="mb-4 h-14 w-14 text-muted-foreground" />
                <p className="font-medium text-foreground">No weekly plan yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Generate an AI plan to see your week
                </p>
                <Button
                  className="mt-4"
                  onClick={handleGeneratePlan}
                  disabled={generating}
                >
                  Generate Plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {dailyWorkouts.map((dw) => {
                const isRest =
                  !dw.exercises || dw.exercises.length === 0
                const expanded = expandedDay === dw.day
                return (
                  <Card key={dw.day}>
                    <CardHeader
                      className="cursor-pointer"
                      onClick={() =>
                        setExpandedDay(expanded ? null : dw.day)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {dw.day_name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {isRest ? "Rest Day" : dw.focus}
                          </p>
                        </div>
                        {expanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                      {!isRest && (
                        <div className="mt-2 flex gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {dw.total_duration} min
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {dw.exercises.length} exercises
                          </Badge>
                        </div>
                      )}
                    </CardHeader>
                    {expanded && !isRest && (
                      <CardContent className="pt-0">
                        <p className="mb-2 text-xs text-muted-foreground">
                          ⏰ {dw.recommended_time}
                        </p>
                        <ul className="space-y-1 text-sm">
                          {dw.exercises.map((e) => (
                            <li key={e.name}>• {e.name}</li>
                          ))}
                        </ul>
                        <p className="mt-3 text-xs text-muted-foreground">
                          Warmup: {dw.warmup.slice(0, 50)}...
                        </p>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!activeVideo} onOpenChange={() => setActiveVideo(null)}>
        <DialogContent className="max-h-[95vh] max-w-4xl overflow-y-auto">
          {activeVideo && (
            <>
              <DialogHeader>
                <DialogTitle>{activeVideo.exercise.name}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <div className="aspect-video overflow-hidden rounded-lg bg-black">
                    <iframe
                      width="100%"
                      height="100%"
                      src={activeVideo.url.replace("watch?v=", "embed/")}
                      title="Exercise"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Instructions</p>
                    <p className="text-sm text-muted-foreground">
                      {activeVideo.exercise.instructions}
                    </p>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <Badge>{activeVideo.exercise.sets} sets</Badge>
                    <Badge variant="outline">
                      {activeVideo.exercise.reps} reps
                    </Badge>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="mb-2 text-sm font-medium">Workout Tracker</p>
                    <div className="mb-2 flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      <span className="font-mono">
                        {formatTime(workoutTimer)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTimerRunning(!timerRunning)}
                    >
                      {timerRunning ? "Pause" : "Start"} Timer
                    </Button>
                    <div className="mt-3">
                      <Input
                        placeholder="Reps completed"
                        type="number"
                        value={repsInput}
                        onChange={(e) => setRepsInput(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={completionModalOpen} onOpenChange={setCompletionModalOpen}>
        <DialogContent>
          {showConfetti && <ConfettiCelebration />}
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              🏆 Workout Complete!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-2xl font-bold text-primary">
                  {workout?.total_duration ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">Minutes</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-2xl font-bold text-primary">
                  {workout?.exercises?.length ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">Exercises</p>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              What you achieved today:
            </p>
            <ul className="space-y-2">
              {workout?.exercises?.map((e) => (
                <li key={e.name} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  {e.name}
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              onClick={() => setCompletionModalOpen(false)}
            >
              Keep Going! 💪
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
