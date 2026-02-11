"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  Salad,
  Plus,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Sparkles,
  Clock,
  Utensils,
  Target,
  TrendingUp,
  Lightbulb,
  RefreshCw,
  Calendar,
  CheckCircle,
} from "lucide-react"

// ── Interfaces ──────────────────────────────────────────────

interface Meal {
  id: string
  name: string
  meal_type: string | null
  calories: number | null
  protein_grams: number | null
  carbs_grams: number | null
  fat_grams: number | null
  ingredients: Array<{ name: string; quantity: string }> | null
  day_of_week: string | null
}

interface NutritionPlan {
  id: string
  name: string
  description: string | null
  daily_calories: number | null
  protein_grams: number | null
  carbs_grams: number | null
  fat_grams: number | null
  dietary_type: string | null
  is_active: boolean
  meals: Meal[]
}

interface AIMeal {
  meal_type: string
  time: string
  name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  ingredients: string[]
}

interface AIDailyPlan {
  day: number
  day_name: string
  total_calories: number
  meals: AIMeal[]
}

interface AINutritionPlan {
  daily_calories_target: number
  daily_plans: AIDailyPlan[]
  weekly_tips: string[]
  macro_targets: {
    protein_percent: number
    carbs_percent: number
    fat_percent: number
  }
}

interface Profile {
  full_name?: string | null
  age?: number | null
  gender?: string | null
  height_cm?: number | null
  weight_kg?: number | null
  fitness_goal?: string | null
  activity_level?: string | null
  dietary_preference?: string | null
}

interface Assessment {
  bmi?: number | null
  bmi_category?: string | null
  health_conditions?: string[] | null
  injuries?: string[] | null
}

interface NutritionViewProps {
  userId: string
  nutritionPlans: NutritionPlan[]
  profile?: Profile | null
  assessment?: Assessment | null
  source?: "supabase" | "backend"
}

// ── Macro Bar ───────────────────────────────────────────────

function MacroBar({
  label,
  value,
  max,
  color,
  unit = "g",
}: {
  label: string
  value: number
  max: number
  color: string
  unit?: string
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">
          {value}
          {unit}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ── Component ───────────────────────────────────────────────

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function NutritionView({
  userId,
  nutritionPlans,
  profile,
  assessment,
  source = "supabase",
}: NutritionViewProps) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null)
  const [showShopping, setShowShopping] = useState<string | null>(null)

  // AI generation state
  const [generating, setGenerating] = useState(false)
  const [aiPlan, setAiPlan] = useState<AINutritionPlan | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState(0)
  const [savingAiPlan, setSavingAiPlan] = useState(false)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [genStatus, setGenStatus] = useState("Preparing your plan...")

  // AI form overrides
  const [aiDietPref, setAiDietPref] = useState(
    profile?.dietary_preference || "vegetarian"
  )
  const [aiFoodAllergies, setAiFoodAllergies] = useState("")
  const [aiFitnessGoal, setAiFitnessGoal] = useState(
    profile?.fitness_goal || "general_fitness"
  )

  // Manual plan form
  const [planName, setPlanName] = useState("")
  const [planCalories, setPlanCalories] = useState("")
  const [planProtein, setPlanProtein] = useState("")
  const [planCarbs, setPlanCarbs] = useState("")
  const [planFat, setPlanFat] = useState("")
  const [planDietType, setPlanDietType] = useState("")

  // New meal form
  const [addingMealTo, setAddingMealTo] = useState<string | null>(null)
  const [mealName, setMealName] = useState("")
  const [mealType, setMealType] = useState("")
  const [mealCalories, setMealCalories] = useState("")
  const [mealProtein, setMealProtein] = useState("")
  const [mealCarbs, setMealCarbs] = useState("")
  const [mealFat, setMealFat] = useState("")
  const [mealIngredients, setMealIngredients] = useState("")
  const [mealDay, setMealDay] = useState("")

  // ── AI Generation ───────────────────────────────────────

  const handleGenerateAIPlan = async () => {
    setGenerating(true)
    setAiError(null)
    setAiPlan(null)
    setSelectedDay(0)
    setGenStatus("Calculating nutritional requirements...")

    const messages = [
      "Calculating nutritional requirements...",
      "Analyzing dietary preferences...",
      "Curating traditional Indian recipes...",
      "Optimizing macro-nutrient balance...",
      "Finalizing your 7-day meal plan..."
    ]
    let msgIdx = 0
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % messages.length
      setGenStatus(messages[msgIdx])
    }, 2500)

    try {
      const res = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: profile?.age || 25,
          gender: profile?.gender || "male",
          weight: profile?.weight_kg || 70,
          height: profile?.height_cm || 170,
          fitness_goal: aiFitnessGoal,
          activity_level: profile?.activity_level || "intermediate",
          diet_preference: aiDietPref,
          food_allergies: aiFoodAllergies || "None",
        }),
      })

      const data = await res.json()
      clearInterval(interval)

      if (data.error && !data.fallback) {
        toast.warning(data.error)
      }

      setAiPlan(data.plan ?? null)
      setAiError(data.error ?? null)
    } catch (err: unknown) {
      clearInterval(interval)
      setAiError("Failed to load plan. Try generating one.")
      toast.error("Failed to load nutrition plan.")
      setAiPlan(null)
    } finally {
      setGenerating(false)
    }
  }

  const handleSaveAIPlan = async () => {
    if (!aiPlan) return
    setSavingAiPlan(true)
    const avgCalories = aiPlan.daily_calories_target || 2000
    const totalProtein = Math.round(
      (avgCalories * (aiPlan.macro_targets?.protein_percent || 30)) / 400
    )
    const totalCarbs = Math.round(
      (avgCalories * (aiPlan.macro_targets?.carbs_percent || 40)) / 400
    )
    const totalFat = Math.round(
      (avgCalories * (aiPlan.macro_targets?.fat_percent || 30)) / 900
    )
    const planName = `AI Plan - ${aiDietPref} (${avgCalories} kcal)`
    const description = `Generated by AROMI AI - ${aiDietPref} meal plan targeting ${avgCalories} kcal/day`

    if (source === "backend") {
      try {
        const mealsPayload = aiPlan.daily_plans.flatMap((day) =>
          day.meals.map((meal) => ({
            name: meal.name,
            meal_type: meal.meal_type ?? undefined,
            time: meal.time,
            calories: meal.calories,
            protein_g: meal.protein_g,
            carbs_g: meal.carbs_g,
            fat_g: meal.fat_g,
            ingredients: meal.ingredients ?? [],
            day_of_week: day.day_name,
          }))
        )
        const res = await fetch("/api/backend/nutrition/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: planName,
            description,
            daily_calories: avgCalories,
            protein_grams: totalProtein,
            carbs_grams: totalCarbs,
            fat_grams: totalFat,
            dietary_type: aiDietPref,
            meals: mealsPayload,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          toast.error(err?.error ?? "Failed to save plan")
        } else {
          toast.success("Diet plan saved. You can reuse it anytime.")
          setAiPlan(null)
          setAiDialogOpen(false)
          router.refresh()
        }
      } catch (e) {
        toast.error("Failed to save plan")
      }
      setSavingAiPlan(false)
      return
    }

    const supabase = createClient()
    const { data: plan } = await supabase
      .from("nutrition_plans")
      .insert({
        user_id: userId,
        name: planName,
        description,
        daily_calories: avgCalories,
        protein_grams: totalProtein,
        carbs_grams: totalCarbs,
        fat_grams: totalFat,
        dietary_type: aiDietPref,
        is_active: true,
      })
      .select()
      .single()

    if (plan) {
      const meals = aiPlan.daily_plans.flatMap((day) =>
        day.meals.map((meal) => ({
          nutrition_plan_id: plan.id,
          user_id: userId,
          name: meal.name,
          meal_type: meal.meal_type?.toLowerCase() || null,
          calories: meal.calories,
          protein_grams: meal.protein_g,
          carbs_grams: meal.carbs_g,
          fat_grams: meal.fat_g,
          ingredients: meal.ingredients.map((i) => ({
            name: i,
            quantity: "as needed",
          })),
          day_of_week: day.day_name,
        }))
      )
      await supabase.from("meals").insert(meals)
      toast.success("Diet plan saved. You can reuse it anytime.")
    }
    setSavingAiPlan(false)
    setAiPlan(null)
    setAiDialogOpen(false)
    router.refresh()
  }

  // ── Manual plan ─────────────────────────────────────────

  const handleCreatePlan = async () => {
    if (!planName) return
    setCreating(true)
    if (source === "backend") {
      try {
        const res = await fetch("/api/backend/nutrition/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: planName,
            daily_calories: planCalories ? parseInt(planCalories) : null,
            protein_grams: planProtein ? parseInt(planProtein) : null,
            carbs_grams: planCarbs ? parseInt(planCarbs) : null,
            fat_grams: planFat ? parseInt(planFat) : null,
            dietary_type: planDietType || null,
            meals: [],
          }),
        })
        if (res.ok) {
          toast.success("Plan created")
          setPlanName("")
          setPlanCalories("")
          setPlanProtein("")
          setPlanCarbs("")
          setPlanFat("")
          setPlanDietType("")
          setDialogOpen(false)
          router.refresh()
        } else toast.error("Failed to create plan")
      } catch {
        toast.error("Failed to create plan")
      }
      setCreating(false)
      return
    }
    const supabase = createClient()
    await supabase.from("nutrition_plans").insert({
      user_id: userId,
      name: planName,
      daily_calories: planCalories ? parseInt(planCalories) : null,
      protein_grams: planProtein ? parseInt(planProtein) : null,
      carbs_grams: planCarbs ? parseInt(planCarbs) : null,
      fat_grams: planFat ? parseInt(planFat) : null,
      dietary_type: planDietType || null,
    })
    setPlanName("")
    setPlanCalories("")
    setPlanProtein("")
    setPlanCarbs("")
    setPlanFat("")
    setPlanDietType("")
    setDialogOpen(false)
    setCreating(false)
    router.refresh()
  }

  const handleAddMeal = async (planId: string) => {
    if (!mealName) return
    if (source === "backend") {
      try {
        const ingredients = mealIngredients
          ? mealIngredients.split(",").map((i) => ({ name: i.trim(), quantity: "as needed" }))
          : []
        const res = await fetch("/api/backend/nutrition/meals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: mealName,
            meal_type: mealType || null,
            calories: mealCalories ? parseInt(mealCalories) : null,
            protein: mealProtein ? parseInt(mealProtein) : null,
            carbs: mealCarbs ? parseInt(mealCarbs) : null,
            fat: mealFat ? parseInt(mealFat) : null,
            ingredients,
            day_of_week: mealDay || null,
            nutrition_plan_id: parseInt(planId, 10) || null,
          }),
        })
        if (res.ok) {
          toast.success("Meal added")
          setMealName("")
          setMealType("")
          setMealCalories("")
          setMealProtein("")
          setMealCarbs("")
          setMealFat("")
          setMealIngredients("")
          setMealDay("")
          setAddingMealTo(null)
          router.refresh()
        } else toast.error("Failed to add meal")
      } catch {
        toast.error("Failed to add meal")
      }
      return
    }
    const supabase = createClient()
    const ingredients = mealIngredients
      ? mealIngredients.split(",").map((i) => ({ name: i.trim(), quantity: "as needed" }))
      : []
    await supabase.from("meals").insert({
      nutrition_plan_id: planId,
      user_id: userId,
      name: mealName,
      meal_type: mealType || null,
      calories: mealCalories ? parseInt(mealCalories) : null,
      protein_grams: mealProtein ? parseInt(mealProtein) : null,
      carbs_grams: mealCarbs ? parseInt(mealCarbs) : null,
      fat_grams: mealFat ? parseInt(mealFat) : null,
      ingredients,
      day_of_week: mealDay || null,
    })
    setMealName("")
    setMealType("")
    setMealCalories("")
    setMealProtein("")
    setMealCarbs("")
    setMealFat("")
    setMealIngredients("")
    setMealDay("")
    setAddingMealTo(null)
    router.refresh()
  }

  const handleDeletePlan = async (planId: string) => {
    if (source === "backend") {
      try {
        const res = await fetch(`/api/backend/nutrition/plans?id=${encodeURIComponent(planId)}`, {
          method: "DELETE",
        })
        if (res.ok) {
          toast.success("Plan removed")
          router.refresh()
        } else toast.error("Failed to delete plan")
      } catch {
        toast.error("Failed to delete plan")
      }
      return
    }
    const supabase = createClient()
    await supabase.from("nutrition_plans").delete().eq("id", planId)
    router.refresh()
  }

  const handleDeleteMeal = async (mealId: string) => {
    if (source === "backend") {
      try {
        const res = await fetch(`/api/backend/nutrition/meals?id=${encodeURIComponent(mealId)}`, {
          method: "DELETE",
        })
        if (res.ok) {
          toast.success("Meal removed")
          router.refresh()
        } else toast.error("Failed to delete meal")
      } catch {
        toast.error("Failed to delete meal")
      }
      return
    }
    const supabase = createClient()
    await supabase.from("meals").delete().eq("id", mealId)
    router.refresh()
  }

  const getShoppingList = (plan: NutritionPlan) => {
    const allIngredients: Record<string, boolean> = {}
    plan.meals.forEach((meal) => {
      if (Array.isArray(meal.ingredients)) {
        meal.ingredients.forEach((ing) => {
          if (ing.name) allIngredients[ing.name] = true
        })
      }
    })
    return Object.keys(allIngredients)
  }

  // Helpers for current AI day
  const currentDay = aiPlan?.daily_plans?.[selectedDay]

  const getMealTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "breakfast":
        return "bg-accent/10 text-accent-foreground border-accent/30"
      case "lunch":
        return "bg-primary/10 text-primary border-primary/30"
      case "dinner":
        return "bg-chart-3/10 text-chart-3 border-chart-3/30"
      case "mid-morning snack":
      case "evening snack":
      case "snack":
        return "bg-chart-4/10 text-chart-4 border-chart-4/30"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // ── Render ──────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Nutrition Plans
          </h2>
          <p className="text-sm text-muted-foreground">
            AI-powered meal planning with personalized Indian cuisine
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Generate AI Plan</span>
                <span className="sm:hidden">AI Plan</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Nutrition Plan Generator
                </DialogTitle>
              </DialogHeader>

              {/* AI Generation Form */}
              {!aiPlan && (
                <div className="flex flex-col gap-4">
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="mb-3 text-sm font-medium text-foreground">
                      Your Profile
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
                      <div className="text-muted-foreground">Age</div>
                      <div className="font-medium">{profile?.age || "—"}</div>
                      <div className="text-muted-foreground">Gender</div>
                      <div className="font-medium capitalize">
                        {profile?.gender || "—"}
                      </div>
                      <div className="text-muted-foreground">Weight</div>
                      <div className="font-medium">
                        {profile?.weight_kg ? `${profile.weight_kg} kg` : "—"}
                      </div>
                      <div className="text-muted-foreground">Height</div>
                      <div className="font-medium">
                        {profile?.height_cm ? `${profile.height_cm} cm` : "—"}
                      </div>
                      <div className="text-muted-foreground">Activity</div>
                      <div className="font-medium capitalize">
                        {profile?.activity_level || "—"}
                      </div>
                      {assessment?.bmi && (
                        <>
                          <div className="text-muted-foreground">BMI</div>
                          <div className="font-medium">
                            {assessment.bmi} ({assessment.bmi_category})
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label>Fitness Goal</Label>
                      <Select value={aiFitnessGoal} onValueChange={setAiFitnessGoal}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weight_loss">Weight Loss</SelectItem>
                          <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                          <SelectItem value="general_fitness">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Diet Preference</Label>
                      <Select value={aiDietPref} onValueChange={setAiDietPref}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="vegan">Vegan</SelectItem>
                          <SelectItem value="non_vegetarian">Non-Vegetarian</SelectItem>
                          <SelectItem value="eggetarian">Eggetarian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Food Allergies / Restrictions</Label>
                    <Input
                      placeholder="e.g. Peanuts, Gluten, Dairy (leave empty for none)"
                      value={aiFoodAllergies}
                      onChange={(e) => setAiFoodAllergies(e.target.value)}
                    />
                  </div>

                  {aiError && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                      {aiError}
                    </div>
                  )}

                  <Button
                    onClick={handleGenerateAIPlan}
                    disabled={generating}
                    className="relative gap-2 overflow-hidden"
                    size="lg"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{genStatus}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Personalized Plan
                      </>
                    )}
                  </Button>

                  {generating && (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Applying AI models to curate your recipes...</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Plan includes breakfast, lunch, dinner & snacks
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* AI Plan Results */}
              {aiPlan && (
                <div className="flex flex-col gap-4">
                  {/* Calorie & Macro Summary */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg border border-border bg-card p-3 text-center">
                      <Flame className="mx-auto mb-1 h-5 w-5 text-orange-500" />
                      <p className="text-lg font-bold text-foreground">
                        {aiPlan.daily_calories_target}
                      </p>
                      <p className="text-xs text-muted-foreground">kcal/day</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-3 text-center">
                      <Beef className="mx-auto mb-1 h-5 w-5 text-destructive" />
                      <p className="text-lg font-bold text-foreground">
                        {aiPlan.macro_targets?.protein_percent || 30}%
                      </p>
                      <p className="text-xs text-muted-foreground">Protein</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-3 text-center">
                      <Wheat className="mx-auto mb-1 h-5 w-5 text-accent" />
                      <p className="text-lg font-bold text-foreground">
                        {aiPlan.macro_targets?.carbs_percent || 40}%
                      </p>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-3 text-center">
                      <Droplets className="mx-auto mb-1 h-5 w-5 text-chart-3" />
                      <p className="text-lg font-bold text-foreground">
                        {aiPlan.macro_targets?.fat_percent || 30}%
                      </p>
                      <p className="text-xs text-muted-foreground">Fat</p>
                    </div>
                  </div>

                  {/* Day Tabs - Scrollable on mobile */}
                  <div className="w-full overflow-x-auto">
                    <div className="flex gap-1.5 pb-1">
                      {aiPlan.daily_plans.map((day, idx) => (
                        <button
                          key={day.day}
                          onClick={() => setSelectedDay(idx)}
                          className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${selectedDay === idx
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                        >
                          <span className="hidden sm:inline">{day.day_name}</span>
                          <span className="sm:hidden">
                            {day.day_name.slice(0, 3)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected Day Detail */}
                  {currentDay && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">
                          {currentDay.day_name}
                        </h4>
                        <Badge variant="secondary" className="gap-1">
                          <Flame className="h-3 w-3" />
                          {currentDay.total_calories} kcal
                        </Badge>
                      </div>

                      <ScrollArea className="max-h-[300px] pr-2">
                        <div className="flex flex-col gap-2">
                          {currentDay.meals.map((meal, mealIdx) => (
                            <div
                              key={mealIdx}
                              className={`rounded-lg border p-3 ${getMealTypeColor(meal.meal_type)}`}
                            >
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] font-medium uppercase"
                                    >
                                      {meal.meal_type}
                                    </Badge>
                                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      {meal.time}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-sm font-medium text-foreground">
                                    {meal.name}
                                  </p>
                                  <div className="mt-1.5 flex flex-wrap gap-1">
                                    {meal.ingredients?.map((ing, i) => (
                                      <span
                                        key={i}
                                        className="rounded-md bg-background/50 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                                      >
                                        {ing}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-3 text-[11px]">
                                  <span className="font-medium">
                                    {meal.calories} cal
                                  </span>
                                  <span>P: {meal.protein_g}g</span>
                                  <span>C: {meal.carbs_g}g</span>
                                  <span>F: {meal.fat_g}g</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  {/* Weekly Tips */}
                  {aiPlan.weekly_tips && aiPlan.weekly_tips.length > 0 && (
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        Weekly Tips
                      </p>
                      <ul className="flex flex-col gap-1">
                        {aiPlan.weekly_tips.map((tip, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-xs text-muted-foreground"
                          >
                            <CheckCircle className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      onClick={handleSaveAIPlan}
                      disabled={savingAiPlan}
                      className="flex-1 gap-2"
                    >
                      {savingAiPlan ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Save Plan
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAiPlan(null)
                        setAiError(null)
                      }}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Regenerate
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Manual Plan</span>
                <span className="sm:hidden">Manual</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">
                  Create Nutrition Plan
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Plan Name</Label>
                  <Input
                    placeholder="e.g. High Protein Indian Diet"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label>Daily Calories</Label>
                    <Input
                      type="number"
                      placeholder="2000"
                      value={planCalories}
                      onChange={(e) => setPlanCalories(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Dietary Type</Label>
                    <Select value={planDietType} onValueChange={setPlanDietType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                        <SelectItem value="non_vegetarian">Non-Veg</SelectItem>
                        <SelectItem value="eggetarian">Eggetarian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label>Protein (g)</Label>
                    <Input
                      type="number"
                      placeholder="150"
                      value={planProtein}
                      onChange={(e) => setPlanProtein(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Carbs (g)</Label>
                    <Input
                      type="number"
                      placeholder="200"
                      value={planCarbs}
                      onChange={(e) => setPlanCarbs(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Fat (g)</Label>
                    <Input
                      type="number"
                      placeholder="60"
                      value={planFat}
                      onChange={(e) => setPlanFat(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleCreatePlan} disabled={creating || !planName}>
                  {creating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Create Plan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Existing Plans */}
      {nutritionPlans.length === 0 && !aiPlan ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
              <Salad className="h-7 w-7 text-accent" />
            </div>
            <p className="font-medium text-foreground">No nutrition plans yet</p>
            <p className="mt-1 max-w-xs text-center text-sm text-muted-foreground">
              Use the AI generator for a personalized 7-day Indian meal plan, or
              create one manually
            </p>
            <Button
              className="mt-4 gap-2"
              onClick={() => setAiDialogOpen(true)}
            >
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {nutritionPlans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div
                    className="flex cursor-pointer items-center gap-3"
                    onClick={() =>
                      setExpandedPlan(expandedPlan === plan.id ? null : plan.id)
                    }
                    onKeyDown={() => { }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <Salad className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {plan.dietary_type && (
                          <Badge
                            variant="secondary"
                            className="text-xs capitalize"
                          >
                            {plan.dietary_type.replace("_", " ")}
                          </Badge>
                        )}
                        {plan.daily_calories && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Flame className="h-3 w-3" />
                            {plan.daily_calories} cal/day
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {plan.meals.length} meals
                        </span>
                      </div>
                    </div>
                    {expandedPlan === plan.id ? (
                      <ChevronUp className="ml-2 h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setShowShopping(
                          showShopping === plan.id ? null : plan.id
                        )
                      }
                      className="text-muted-foreground"
                      title="Shopping List"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePlan(plan.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Macro breakdown */}
                {(plan.protein_grams || plan.carbs_grams || plan.fat_grams) && (
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {plan.protein_grams && (
                      <MacroBar
                        label="Protein"
                        value={plan.protein_grams}
                        max={200}
                        color="bg-destructive"
                      />
                    )}
                    {plan.carbs_grams && (
                      <MacroBar
                        label="Carbs"
                        value={plan.carbs_grams}
                        max={300}
                        color="bg-accent"
                      />
                    )}
                    {plan.fat_grams && (
                      <MacroBar
                        label="Fat"
                        value={plan.fat_grams}
                        max={100}
                        color="bg-chart-3"
                      />
                    )}
                  </div>
                )}
              </CardHeader>

              {/* Shopping List */}
              {showShopping === plan.id && (
                <CardContent className="border-t border-border pt-4">
                  <p className="mb-2 text-sm font-medium text-foreground">
                    Shopping List
                  </p>
                  {getShoppingList(plan).length > 0 ? (
                    <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4">
                      {getShoppingList(plan).map((item) => (
                        <li
                          key={item}
                          className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-1.5 text-sm text-foreground"
                        >
                          <span className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {item}
                          </span>
                          <a
                            href={`https://www.bigbasket.com/ps/?q=${encodeURIComponent(item)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            Buy
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Add meals with ingredients to generate a shopping list
                    </p>
                  )}
                </CardContent>
              )}

              {/* Daily diet: meals grouped by day (Monday, Tuesday, ...) */}
              {expandedPlan === plan.id && (
                <CardContent className="flex flex-col gap-3">
                  <p className="text-sm font-medium text-foreground">Daily plan</p>
                  {(() => {
                    const days = new Map<string, Meal[]>()
                    plan.meals.forEach((meal) => {
                      const day = meal.day_of_week || "Unscheduled"
                      if (!days.has(day)) days.set(day, [])
                      days.get(day)!.push(meal)
                    })

                    const sorted = [...days.entries()].sort(
                      (a, b) => DAY_ORDER.indexOf(a[0]) - DAY_ORDER.indexOf(b[0])
                    )
                    const unschedIdx = sorted.findIndex(([d]) => d === "Unscheduled")
                    if (unschedIdx >= 0) {
                      const [u] = sorted.splice(unschedIdx, 1)
                      sorted.push(u)
                    }

                    return sorted.map(([day, meals]) => (
                      <div key={day}>
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {day}
                        </div>
                        <div className="flex flex-col gap-2">
                          {meals.map((meal) => (
                            <div
                              key={meal.id}
                              className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                            >
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-medium text-foreground">
                                    {meal.name}
                                  </p>
                                  {meal.meal_type && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs capitalize"
                                    >
                                      {meal.meal_type}
                                    </Badge>
                                  )}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {[
                                    meal.calories && `${meal.calories} cal`,
                                    meal.protein_grams &&
                                    `${meal.protein_grams}g protein`,
                                    meal.carbs_grams &&
                                    `${meal.carbs_grams}g carbs`,
                                    meal.fat_grams && `${meal.fat_grams}g fat`,
                                  ]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteMeal(meal.id)}
                                className="shrink-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  })()}

                  {addingMealTo === plan.id ? (
                    <div className="rounded-lg border border-border bg-card p-4">
                      <p className="mb-3 text-sm font-medium text-foreground">
                        Add Meal
                      </p>
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <Input
                            placeholder="Meal name"
                            value={mealName}
                            onChange={(e) => setMealName(e.target.value)}
                          />
                          <Select value={mealType} onValueChange={setMealType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Meal type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="breakfast">Breakfast</SelectItem>
                              <SelectItem value="lunch">Lunch</SelectItem>
                              <SelectItem value="dinner">Dinner</SelectItem>
                              <SelectItem value="snack">Snack</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <Input
                            type="number"
                            placeholder="Calories"
                            value={mealCalories}
                            onChange={(e) => setMealCalories(e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="Protein"
                            value={mealProtein}
                            onChange={(e) => setMealProtein(e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="Carbs"
                            value={mealCarbs}
                            onChange={(e) => setMealCarbs(e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="Fat"
                            value={mealFat}
                            onChange={(e) => setMealFat(e.target.value)}
                          />
                        </div>
                        <Input
                          placeholder="Ingredients (comma separated): rice, dal, ghee..."
                          value={mealIngredients}
                          onChange={(e) => setMealIngredients(e.target.value)}
                        />
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button
                            variant="outline"
                            onClick={() => setAddingMealTo(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleAddMeal(plan.id)}
                            disabled={!mealName}
                          >
                            Add Meal
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => setAddingMealTo(plan.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Meal
                    </Button>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
