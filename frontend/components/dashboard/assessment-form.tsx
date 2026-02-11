"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Loader2, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const TOTAL_QUESTIONS = 14

const GENDER_OPTIONS = ["Male", "Female", "Other"] as const
const FITNESS_LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"] as const
const FITNESS_GOAL_OPTIONS = [
  "Weight Loss",
  "Muscle Gain",
  "General Fitness",
  "Strength Training",
  "Endurance",
] as const
const WORKOUT_PREFERENCE_OPTIONS = ["Home", "Gym", "Outdoor", "Mixed"] as const
const WORKOUT_TIME_OPTIONS = ["Morning", "Evening"] as const

interface FormData {
  age: string
  gender: string
  height: string
  weight: string
  fitness_level: string
  fitness_goal: string
  workout_preference: string
  workout_time_preference: string
  medical_history: string
  health_conditions: string
  injuries: string
  food_allergies: string
  medications: string
  google_calendar_sync: boolean
}

interface AssessmentFormProps {
  userId?: string
  profile?: {
    height_cm: number | null
    weight_kg: number | null
    age: number | null
    gender: string | null
    fitness_goal: string | null
    activity_level: string | null
    dietary_preference: string | null
  } | null
  existingAssessment?: Record<string, unknown> | null
}

const initialFormData: FormData = {
  age: "",
  gender: "",
  height: "",
  weight: "",
  fitness_level: "",
  fitness_goal: "",
  workout_preference: "",
  workout_time_preference: "",
  medical_history: "",
  health_conditions: "",
  injuries: "",
  food_allergies: "",
  medications: "",
  google_calendar_sync: false,
}

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border-2 px-6 py-4 text-left text-base font-medium transition-all duration-300",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-md"
          : "border-border bg-card text-card-foreground hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      {label}
    </button>
  )
}

export function AssessmentForm({
  profile,
}: AssessmentFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>(() => ({
    ...initialFormData,
    age: profile?.age?.toString() ?? "",
    height: profile?.height_cm?.toString() ?? "",
    weight: profile?.weight_kg?.toString() ?? "",
    gender: profile?.gender
      ? String(profile.gender).charAt(0).toUpperCase() + String(profile.gender).slice(1).toLowerCase()
      : "",
    fitness_goal: profile?.fitness_goal
      ? profile.fitness_goal
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : "",
  }))

  const update = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }, [])

  const progressPercent = (step / TOTAL_QUESTIONS) * 100

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/health-assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: parseInt(formData.age, 10),
          gender: formData.gender,
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          fitness_level: formData.fitness_level,
          fitness_goal: formData.fitness_goal,
          workout_preference: formData.workout_preference,
          workout_time_preference: formData.workout_time_preference,
          medical_history: formData.medical_history || undefined,
          health_conditions: formData.health_conditions || undefined,
          injuries: formData.injuries || undefined,
          food_allergies: formData.food_allergies || undefined,
          medications: formData.medications || undefined,
          google_calendar_sync: formData.google_calendar_sync,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const message = data.message || data.error || "Could not save assessment. Please try again."
        toast.error(message)
        setLoading(false)
        return
      }

      toast.success("Assessment saved! Taking you to your workout plan.")
      router.push("/dashboard/workouts")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  const canProceed =
    (step === 1 && formData.age) ||
    (step === 2 && formData.gender) ||
    (step === 3 && formData.height) ||
    (step === 4 && formData.weight) ||
    (step === 5 && formData.fitness_level) ||
    (step === 6 && formData.fitness_goal) ||
    (step === 7 && formData.workout_preference) ||
    (step === 8 && formData.workout_time_preference) ||
    step >= 9

  return (
    <div className="relative min-h-[60vh] overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm md:p-10">
      <div className="relative">
        {/* Progress */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Question {step} of {TOTAL_QUESTIONS}
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{Math.round(progressPercent)}% complete</p>
        </div>

        {/* Questions */}
        <div className="mb-10 min-h-[280px]">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="mb-6 text-2xl font-bold text-foreground">What is your age?</h2>
              <Input
                type="number"
                min={10}
                max={120}
                placeholder="25"
                value={formData.age}
                onChange={(e) => update("age", e.target.value)}
                className="h-14 rounded-xl border-border bg-background text-lg text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="mb-6 text-2xl font-bold text-foreground">What is your gender?</h2>
              <div className="flex flex-col gap-3">
                {GENDER_OPTIONS.map((opt) => (
                  <OptionButton
                    key={opt}
                    label={opt}
                    selected={formData.gender === opt}
                    onClick={() => update("gender", opt)}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="mb-6 text-2xl font-bold text-foreground">What is your height (in cm)?</h2>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-xl border-border bg-background text-foreground hover:bg-muted"
                  onClick={() => {
                    const v = Math.max(100, parseInt(formData.height, 10) || 170)
                    update("height", String(v - 1))
                  }}
                >
                  −
                </Button>
                <Input
                  type="number"
                  min={100}
                  max={250}
                  placeholder="170"
                  value={formData.height}
                  onChange={(e) => update("height", e.target.value)}
                  className="h-14 flex-1 rounded-xl border-border bg-background text-center text-lg text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-xl border-border bg-background text-foreground hover:bg-muted"
                  onClick={() => {
                    const v = Math.min(250, parseInt(formData.height, 10) || 170)
                    update("height", String(v + 1))
                  }}
                >
                  +
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="mb-6 text-2xl font-bold text-foreground">What is your weight (in kg)?</h2>
              <Input
                type="number"
                min={30}
                max={300}
                step={0.5}
                placeholder="70"
                value={formData.weight}
                onChange={(e) => update("weight", e.target.value)}
                className="h-14 rounded-xl border-border bg-background text-lg text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>
          )}

          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="mb-6 text-2xl font-bold text-foreground">
                What is your current fitness level?
              </h2>
              <div className="flex flex-col gap-3">
                {FITNESS_LEVEL_OPTIONS.map((opt) => (
                  <OptionButton
                    key={opt}
                    label={opt}
                    selected={formData.fitness_level === opt}
                    onClick={() => update("fitness_level", opt)}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="mb-6 text-2xl font-bold text-foreground">
                What is your primary fitness goal?
              </h2>
              <div className="flex flex-col gap-3">
                {FITNESS_GOAL_OPTIONS.map((opt) => (
                  <OptionButton
                    key={opt}
                    label={opt}
                    selected={formData.fitness_goal === opt}
                    onClick={() => update("fitness_goal", opt)}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="mb-6 text-2xl font-bold text-foreground">
                Where do you prefer to work out?
              </h2>
              <div className="flex flex-col gap-3">
                {WORKOUT_PREFERENCE_OPTIONS.map((opt) => (
                  <OptionButton
                    key={opt}
                    label={opt}
                    selected={formData.workout_preference === opt}
                    onClick={() => update("workout_preference", opt)}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="mb-6 text-2xl font-bold text-foreground">
                When do you prefer to work out?
              </h2>
              <div className="flex flex-col gap-3">
                {WORKOUT_TIME_OPTIONS.map((opt) => (
                  <OptionButton
                    key={opt}
                    label={opt}
                    selected={formData.workout_time_preference === opt}
                    onClick={() => update("workout_time_preference", opt)}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 9 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="mb-6 text-2xl font-bold text-foreground">
                Do you have any medical history? <span className="text-muted-foreground">(Optional)</span>
              </h2>
              <Textarea
                placeholder="e.g., Heart condition, Hypertension, etc."
                value={formData.medical_history}
                onChange={(e) => update("medical_history", e.target.value)}
                rows={4}
                className="rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>
          )}

          {step === 10 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="mb-6 text-2xl font-bold text-foreground">
                Do you have any current health conditions?{" "}
                <span className="text-muted-foreground">(Optional)</span>
              </h2>
              <Textarea
                placeholder="e.g., Diabetes, Asthma, Arthritis, etc."
                value={formData.health_conditions}
                onChange={(e) => update("health_conditions", e.target.value)}
                rows={4}
                className="rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>
          )}

          {step === 11 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="mb-6 text-2xl font-bold text-foreground">
                Any past or present injuries? <span className="text-muted-foreground">(Optional)</span>
              </h2>
              <Textarea
                placeholder="e.g., Lower back pain, Knee injury, etc."
                value={formData.injuries}
                onChange={(e) => update("injuries", e.target.value)}
                rows={4}
                className="rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>
          )}

          {step === 12 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="mb-6 text-2xl font-bold text-foreground">
                Do you have any food allergies? <span className="text-muted-foreground">(Optional)</span>
              </h2>
              <Textarea
                placeholder="e.g., Peanuts, Dairy, Gluten, etc."
                value={formData.food_allergies}
                onChange={(e) => update("food_allergies", e.target.value)}
                rows={4}
                className="rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>
          )}

          {step === 13 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="mb-6 text-2xl font-bold text-foreground">
                Are you taking any medications? <span className="text-muted-foreground">(Optional)</span>
              </h2>
              <Textarea
                placeholder="e.g., Blood pressure medication, etc."
                value={formData.medications}
                onChange={(e) => update("medications", e.target.value)}
                rows={4}
                className="rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>
          )}

          {step === 14 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="mb-6 text-2xl font-bold text-foreground">
                Would you like to sync your plan to Google Calendar?
              </h2>
              <label className="flex cursor-pointer items-start gap-4 rounded-xl border-2 border-border bg-muted/30 p-4 transition-colors hover:border-primary/50">
                <Checkbox
                  checked={formData.google_calendar_sync}
                  onCheckedChange={(checked) =>
                    update("google_calendar_sync", checked === true)
                  }
                  className="mt-1 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div>
                  <p className="font-medium text-foreground">
                    Automatically sync plans to my Google Calendar
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your workout and nutrition schedule can be added to Google Calendar for easy tracking.
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    You can connect Google Calendar later from the Dashboard if you’d like.
                  </p>
                </div>
              </label>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-8 w-full py-6 text-lg font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving & generating your plan...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Generate Plan
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Navigation */}
        {step < 14 && (
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="rounded-xl"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={() => setStep((s) => Math.min(TOTAL_QUESTIONS, s + 1))}
              disabled={!canProceed}
              className="rounded-xl"
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
