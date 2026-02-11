import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai"
import { createGroq } from "@ai-sdk/groq"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
})

export const maxDuration = 60

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey || apiKey.startsWith("gsk_your-")) {
    return new Response(
      JSON.stringify({
        error: "Chat unavailable: GROQ_API_KEY not configured. Add it to frontend/.env",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    )
  }
  const {
    messages,
    context,
  }: {
    messages: UIMessage[]
    context?: {
      profile?: {
        full_name?: string
        age?: number
        weight_kg?: number
        height_cm?: number
        fitness_goal?: string
        activity_level?: string
        dietary_preference?: string
      }
      assessment?: {
        bmi?: number
        bmi_category?: string
        health_conditions?: string[]
        injuries?: string[]
        sleep_hours?: number
        stress_level?: string
      }
    }
  } = await req.json()

  const profileInfo = context?.profile
    ? `User Profile:
- Name: ${context.profile.full_name || "Not set"}
- Age: ${context.profile.age || "Not set"}
- Weight: ${context.profile.weight_kg ? `${context.profile.weight_kg} kg` : "Not set"}
- Height: ${context.profile.height_cm ? `${context.profile.height_cm} cm` : "Not set"}
- Fitness Goal: ${context.profile.fitness_goal || "Not set"}
- Activity Level: ${context.profile.activity_level || "Not set"}
- Dietary Preference: ${context.profile.dietary_preference || "Not set"}`
    : ""

  const assessmentInfo = context?.assessment
    ? `Health Assessment:
- BMI: ${context.assessment.bmi || "Not set"} (${context.assessment.bmi_category || "N/A"})
- Health Conditions: ${context.assessment.health_conditions?.join(", ") || "None"}
- Injuries: ${context.assessment.injuries?.join(", ") || "None"}
- Sleep: ${context.assessment.sleep_hours || "Not set"} hours
- Stress Level: ${context.assessment.stress_level || "Not set"}`
    : ""

  const systemPrompt = `You are AROMI, an AI health and wellness coach for ArogyaMitra.

SCOPE – You help with wellness, health, fitness, and nutrition:
- Fitness: workout plans, exercises, muscle groups, training splits (e.g., Monday=back, Tuesday=legs, Wednesday=chest), reps, sets, rest days.
- Workout plans: Create day-by-day plans (e.g., "Monday: Back day – pull-ups, rows, deadlifts. Tuesday: Leg day – squats, lunges...").
- Nutrition: meals, macros, diet plans, healthy eating, Indian cuisine when relevant.
- Health: general wellness, sleep, stress, recovery, injury prevention.
- Medical: symptoms, when to see a doctor, basic health guidance.

LIMITATIONS – Politely decline off-topic questions:
- Do NOT help with: English, mathematics, coding, general knowledge, or topics unrelated to wellness/health.
- If asked about unrelated topics, say: "I'm AROMI, your AI health coach. I focus on wellness, fitness, nutrition, and health. How can I help with your fitness or health goals?"

Be warm, motivating, and practical. Use the user's profile and assessment when available. Keep responses concise but helpful.

${profileInfo}

${assessmentInfo}

Remember: You are AROMI – wellness, fitness, nutrition, and health. Provide actionable advice including workout plans for each day when asked.`

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
  })
}
