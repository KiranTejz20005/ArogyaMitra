import { NextRequest, NextResponse } from "next/server"
import { createGroq } from "@ai-sdk/groq"
import { generateObject } from "ai"
import { z } from "zod"
import { getVideoIdForExercise } from "@/lib/videos"
import { getTokenFromCookie } from "@/lib/backend-api"
import { API_CONFIG } from "@/config/api"

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

const exerciseSchema = z.object({
  name: z.string(),
  sets: z.number(),
  reps: z.string(),
  rest_seconds: z.number(),
  difficulty: z.string(),
  instructions: z.string(),
})

const dailyWorkoutSchema = z.object({
  day: z.number(),
  day_name: z.string(),
  focus: z.string(),
  total_duration: z.number(),
  recommended_time: z.string(),
  warmup: z.string(),
  exercises: z.array(exerciseSchema),
  cooldown: z.string(),
})

const workoutPlanSchema = z.object({
  plan_duration: z.string(),
  daily_workouts: z.array(dailyWorkoutSchema),
  weekly_summary: z.string(),
  tips: z.array(z.string()),
})

type WorkoutPlan = z.infer<typeof workoutPlanSchema>

function buildPrompt(userData: Record<string, unknown>): string {
  const age = userData.age ?? "Not specified"
  const gender = userData.gender ?? "Not specified"
  const fitnessLevel = userData.fitness_level ?? "intermediate"
  const fitnessGoal = userData.fitness_goal ?? "general fitness"
  const workoutPreference = userData.workout_preference ?? "home"
  const workoutTimePreference = userData.workout_time_preference ?? "morning"
  const bmi = userData.bmi ?? "Not calculated"
  const availableTime = userData.available_time_per_day ?? 45
  const healthConditions = (userData.health_conditions as string[]) ?? []
  const injuries = (userData.injuries as string[]) ?? []
  const healthStr = healthConditions.length ? healthConditions.join(", ") : "None"
  const injuriesStr = injuries.length ? injuries.join(", ") : "None"

  return `You are an expert fitness coach. Generate a detailed 7-day workout plan.

User Profile:
- Age: ${age}, Gender: ${gender}
- Fitness Level: ${fitnessLevel}
- Goal: ${fitnessGoal}
- Workout Location: ${workoutPreference}
- Preferred Time: ${workoutTimePreference}
- BMI: ${bmi}
- Available Time: ${availableTime} minutes/day
- Health Considerations: ${healthStr}
- Injuries to avoid: ${injuriesStr}

Generate a JSON object with this EXACT structure:
{
  "plan_duration": "7 days",
  "daily_workouts": [
    {
      "day": 1,
      "day_name": "Monday",
      "focus": "Upper Body and Cardio",
      "total_duration": 45,
      "recommended_time": "6:00 AM - 7:00 AM",
      "warmup": "5-minute jogging in place or jumping jacks",
      "exercises": [
        {
          "name": "Diamond push-ups",
          "sets": 3,
          "reps": "12-15",
          "rest_seconds": 60,
          "difficulty": "intermediate",
          "instructions": "Start in a plank position with your hands closer together than shoulder-width apart..."
        }
      ],
      "cooldown": "5-minute stretching focusing on arms and chest"
    }
  ],
  "weekly_summary": "This plan targets full-body fitness with emphasis on...",
  "tips": ["Stay hydrated", "Focus on form over speed", "Rest adequately"]
}

Rules:
- Include 5 days of workouts, 2 rest days
- Each workout day has 3-5 exercises
- Adapt exercises for ${workoutPreference} environment
- Consider health conditions and injuries
- Include proper warmup/cooldown
- Vary muscle groups daily
- Return ONLY valid JSON, no markdown or extra text.`
}

const FALLBACK_WORKOUT_PLAN: WorkoutPlan = {
  plan_duration: "7 days",
  weekly_summary: "Balanced full-body fitness focusing on strength and mobility.",
  tips: ["Stay hydrated", "Focus on form", "Rest adequately", "Consistency is key"],
  daily_workouts: [
    {
      day: 1,
      day_name: "Monday",
      focus: "Full Body Strength",
      total_duration: 30,
      recommended_time: "Morning",
      warmup: "5 mins dynamic stretching",
      exercises: [
        { name: "Pushups", sets: 3, reps: "12", rest_seconds: 60, difficulty: "beginner", instructions: "Standard pushups" },
        { name: "Squats", sets: 3, reps: "15", rest_seconds: 60, difficulty: "beginner", instructions: "Bodyweight squats" },
        { name: "Plank", sets: 3, reps: "45s", rest_seconds: 60, difficulty: "beginner", instructions: "Hold plank position" }
      ],
      cooldown: "5 mins cool down stretching"
    },
    {
      day: 2,
      day_name: "Tuesday",
      focus: "Cardio & Core",
      total_duration: 25,
      recommended_time: "Evening",
      warmup: "5 mins jogging in place",
      exercises: [
        { name: "Jumping Jacks", sets: 3, reps: "20", rest_seconds: 45, difficulty: "beginner", instructions: "Standard jumping jacks" },
        { name: "Mountain Climbers", sets: 3, reps: "15/side", rest_seconds: 45, difficulty: "beginner", instructions: "Classic mountain climbers" },
        { name: "Crunches", sets: 3, reps: "20", rest_seconds: 45, difficulty: "beginner", instructions: "Standard abs crunches" }
      ],
      cooldown: "5 mins abdominal stretching"
    },
    {
      day: 3,
      day_name: "Wednesday",
      focus: "Rest Day",
      total_duration: 0,
      recommended_time: "All Day",
      warmup: "None",
      exercises: [],
      cooldown: "None"
    },
    {
      day: 4,
      day_name: "Thursday",
      focus: "Upper Body",
      total_duration: 30,
      recommended_time: "Morning",
      warmup: "5 mins arm circles and swings",
      exercises: [
        { name: "Dips", sets: 3, reps: "10", rest_seconds: 60, difficulty: "beginner", instructions: "Tricep dips using a chair" },
        { name: "Shoulder Taps", sets: 3, reps: "20", rest_seconds: 60, difficulty: "beginner", instructions: "Plank with alternate shoulder taps" },
        { name: "Diamond Pushups", sets: 3, reps: "8-10", rest_seconds: 60, difficulty: "intermediate", instructions: "Pushups with hands in diamond shape" }
      ],
      cooldown: "5 mins upper body stretching"
    },
    {
      day: 5,
      day_name: "Friday",
      focus: "Lower Body",
      total_duration: 30,
      recommended_time: "Evening",
      warmup: "5 mins leg swings",
      exercises: [
        { name: "Lunges", sets: 3, reps: "12/side", rest_seconds: 60, difficulty: "beginner", instructions: "Alternating forward lunges" },
        { name: "Glute Bridges", sets: 3, reps: "15", rest_seconds: 60, difficulty: "beginner", instructions: "Classic glute bridge" },
        { name: "Calf Raises", sets: 3, reps: "20", rest_seconds: 60, difficulty: "beginner", instructions: "Standing calf raises" }
      ],
      cooldown: "5 mins lower body stretching"
    },
    {
      day: 6,
      day_name: "Saturday",
      focus: "Active Recovery",
      total_duration: 20,
      recommended_time: "Morning",
      warmup: "3 mins dynamic stretching",
      exercises: [
        { name: "Light Jog", sets: 1, reps: "15 mins", rest_seconds: 0, difficulty: "beginner", instructions: "Low intensity jog" },
        { name: "Yoga Poses", sets: 1, reps: "5 mins", rest_seconds: 30, difficulty: "beginner", instructions: "Basic sun salutation" }
      ],
      cooldown: "2 mins deep breathing"
    },
    {
      day: 7,
      day_name: "Sunday",
      focus: "Rest Day",
      total_duration: 0,
      recommended_time: "All Day",
      warmup: "None",
      exercises: [],
      cooldown: "None"
    }
  ]
}

export async function POST(req: NextRequest) {
  const token = getTokenFromCookie(req.headers.get("cookie") ?? null)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const [userRes, assessmentRes] = await Promise.all([
      fetch(`${API_CONFIG.getBackendUrl()}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_CONFIG.getBackendUrl()}/health/`, { headers: { Authorization: `Bearer ${token}` } }),
    ])
    const user = userRes.ok ? await userRes.json() : null
    const assessment = assessmentRes.ok ? await assessmentRes.json() : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const bmi = (assessment as { bmi?: number })?.bmi ?? null
    const userData = {
      age: 25,
      gender: null,
      fitness_level: (assessment as { activity_level?: string })?.activity_level ?? "intermediate",
      fitness_goal: (assessment as { fitness_goal?: string })?.fitness_goal ?? "general fitness",
      workout_preference: "home",
      workout_time_preference: "morning",
      bmi: bmi ?? "Not calculated",
      available_time_per_day: 45,
      health_conditions: (assessment as { health_conditions?: string[] })?.health_conditions ?? [],
      injuries: (assessment as { injuries?: string[] })?.injuries ?? [],
    }

    let plan: WorkoutPlan
    try {
      const prompt = buildPrompt(userData)
      const { object } = await generateObject({
        model: groq("llama-3.3-70b-versatile"),
        schema: workoutPlanSchema,
        prompt,
      })
      plan = object as WorkoutPlan
    } catch (aiErr) {
      console.error("AI Generation failed, using fallback:", aiErr)
      return NextResponse.json({ plan: FALLBACK_WORKOUT_PLAN, fallback: true, error: "AI generation failed. Using optimized fallback plan." })
    }

    const dailyWorkouts = plan.daily_workouts.map(dw => ({
      ...dw,
      exercises: dw.exercises.map(ex => {
        const videoId = getVideoIdForExercise(ex.name)
        return {
          ...ex,
          youtube_url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null
        }
      })
    }))

    const finalPlan = { ...plan, daily_workouts: dailyWorkouts }

    const planRes = await fetch(`${API_CONFIG.getBackendUrl()}/workouts/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: "AI Generated 7-Day Plan",
        description: finalPlan.weekly_summary,
        difficulty: "intermediate",
        duration_minutes: finalPlan.daily_workouts.reduce((s, d) => s + (d.total_duration || 0), 0),
        plan_data: {
          daily_workouts: finalPlan.daily_workouts,
          weekly_summary: finalPlan.weekly_summary,
          tips: finalPlan.tips,
        },
      }),
    })

    if (!planRes.ok) {
      return NextResponse.json({ plan: finalPlan, warning: "Plan generated but failed to save permanently." })
    }

    const saved = await planRes.json()
    return NextResponse.json({ plan: { ...finalPlan, id: String(saved.id ?? "generated") } })
  } catch (err) {
    console.error("Workout generation error:", err)
    return NextResponse.json({ plan: FALLBACK_WORKOUT_PLAN, fallback: true, error: "System error. Using optimized fallback plan." })
  }
}
