/**
 * Dummy 7-day workout plan (heavy, light, full body, rest) for when user has no plan yet.
 */

export const DUMMY_DAILY_WORKOUTS = [
  {
    day: 1,
    day_name: "Monday",
    focus: "Heavy – Upper Body & Strength",
    total_duration: 45,
    recommended_time: "6:00–7:00 AM",
    warmup: "5 min arm circles, band pull-aparts, light jog in place.",
    cooldown: "5 min stretch chest, shoulders, triceps.",
    exercises: [
      { name: "Bench Press", sets: 4, reps: "6–8", rest_seconds: 90, difficulty: "heavy", instructions: "Barbell or dumbbell. Control descent, drive up." },
      { name: "Bent-Over Row", sets: 4, reps: "8", rest_seconds: 75, difficulty: "heavy", instructions: "Pull to lower chest, squeeze shoulder blades." },
      { name: "Overhead Press", sets: 3, reps: "8", rest_seconds: 60, difficulty: "heavy", instructions: "Strict form, full lockout." },
      { name: "Bicep Curls", sets: 3, reps: "10", rest_seconds: 45, difficulty: "intermediate", instructions: "Controlled curl, no swing." },
    ],
  },
  {
    day: 2,
    day_name: "Tuesday",
    focus: "Light – Cardio & Core",
    total_duration: 30,
    recommended_time: "Morning or evening",
    warmup: "5 min walk or light jog.",
    cooldown: "5 min walk + stretch.",
    exercises: [
      { name: "Brisk Walk or Jog", sets: 1, reps: "20 min", rest_seconds: 0, difficulty: "light", instructions: "Steady pace, keep heart rate moderate." },
      { name: "Plank", sets: 3, reps: "45s", rest_seconds: 30, difficulty: "light", instructions: "Hold strict plank, engage core." },
      { name: "Bird Dogs", sets: 3, reps: "12/side", rest_seconds: 30, difficulty: "light", instructions: "Alternate arm and leg, keep back flat." },
    ],
  },
  {
    day: 3,
    day_name: "Wednesday",
    focus: "Full Body – Mixed Intensity",
    total_duration: 40,
    recommended_time: "6:00–6:45 AM",
    warmup: "5 min dynamic stretch and bodyweight squats.",
    cooldown: "5 min full-body stretch.",
    exercises: [
      { name: "Squats", sets: 3, reps: "12", rest_seconds: 60, difficulty: "intermediate", instructions: "Bodyweight or goblet. Depth to parallel." },
      { name: "Push-Ups", sets: 3, reps: "12", rest_seconds: 45, difficulty: "intermediate", instructions: "Chest to floor, full extension." },
      { name: "Romanian Deadlift", sets: 3, reps: "10", rest_seconds: 60, difficulty: "intermediate", instructions: "Hinge at hips, slight knee bend." },
      { name: "Mountain Climbers", sets: 3, reps: "20", rest_seconds: 45, difficulty: "intermediate", instructions: "Drive knees to chest, keep hips level." },
    ],
  },
  {
    day: 4,
    day_name: "Thursday",
    focus: "Light – Mobility & Recovery",
    total_duration: 25,
    recommended_time: "Anytime",
    warmup: "3 min light movement.",
    cooldown: "5 min deep stretch.",
    exercises: [
      { name: "Yoga Flow", sets: 1, reps: "15 min", rest_seconds: 0, difficulty: "light", instructions: "Sun salutations and hip openers." },
      { name: "Foam Roll", sets: 1, reps: "5 min", rest_seconds: 0, difficulty: "light", instructions: "Quads, glutes, upper back." },
    ],
  },
  {
    day: 5,
    day_name: "Friday",
    focus: "Heavy – Lower Body",
    total_duration: 50,
    recommended_time: "6:00–7:00 AM",
    warmup: "5 min leg swings, bodyweight squats, band work.",
    cooldown: "5 min leg and hip stretch.",
    exercises: [
      { name: "Back Squat", sets: 4, reps: "6–8", rest_seconds: 90, difficulty: "heavy", instructions: "Full depth, drive through heels." },
      { name: "Romanian Deadlift", sets: 4, reps: "8", rest_seconds: 75, difficulty: "heavy", instructions: "Focus on hamstring stretch." },
      { name: "Lunges", sets: 3, reps: "10/side", rest_seconds: 60, difficulty: "intermediate", instructions: "Walking or reverse lunges." },
      { name: "Calf Raises", sets: 3, reps: "15", rest_seconds: 45, difficulty: "light", instructions: "Full range at edge of step." },
    ],
  },
  {
    day: 6,
    day_name: "Saturday",
    focus: "Light – Active Recovery",
    total_duration: 30,
    recommended_time: "Morning",
    warmup: "3 min walk.",
    cooldown: "3 min stretch.",
    exercises: [
      { name: "Swim or Bike", sets: 1, reps: "20 min", rest_seconds: 0, difficulty: "light", instructions: "Easy pace, enjoy the movement." },
      { name: "Light Stretch", sets: 1, reps: "10 min", rest_seconds: 0, difficulty: "light", instructions: "Full body, hold 30s per muscle." },
    ],
  },
  {
    day: 7,
    day_name: "Sunday",
    focus: "Rest Day",
    total_duration: 0,
    recommended_time: "All day",
    warmup: "None",
    cooldown: "None",
    exercises: [],
  },
]

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function getDummyTodayWorkout() {
  const dayName = DAY_NAMES[new Date().getDay()]
  return DUMMY_DAILY_WORKOUTS.find((d) => d.day_name === dayName) ?? DUMMY_DAILY_WORKOUTS[0]
}

export const DUMMY_PLAN = {
  id: "dummy",
  name: "Sample 7-Day Plan (Heavy, Light, Mixed)",
  plan_data: {
    daily_workouts: DUMMY_DAILY_WORKOUTS,
    weekly_summary: "Heavy days Mon/Fri, light Tue/Thu/Sat, full body Wed, rest Sunday.",
    tips: ["Stay consistent", "Hydrate well", "Sleep 7–8 hours", "Progress gradually"],
  },
}
