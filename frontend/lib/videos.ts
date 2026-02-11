/**
 * Curated YouTube embed list – no YouTube Data API.
 * All videos are embedded via iframe (see /videos page and YouTubePlayerWithControls).
 */
export const VIDEOS = [
  { id: "enYITYwvPAQ", title: "FAST Walking in 30 minutes | Fitness Videos", thumbnail: "https://img.youtube.com/vi/enYITYwvPAQ/hqdefault.jpg" },
  { id: "cvEJ5WFk2KE", title: "30 Minute Boosted Fitness Walk | Walk at Home", thumbnail: "https://img.youtube.com/vi/cvEJ5WFk2KE/hqdefault.jpg" },
  { id: "TJXFF0LknNs", title: "15 Minutes Yoga for Beginners | Simple Home Practice", thumbnail: "https://img.youtube.com/vi/TJXFF0LknNs/hqdefault.jpg" },
  { id: "gC_L9qAHVJ8", title: "30 Min Fat Burning Home Workout for Beginners", thumbnail: "https://img.youtube.com/vi/gC_L9qAHVJ8/hqdefault.jpg" },
  { id: "mpfAv1KL_YM", title: "5 Minutes = 45 Min of Jogging | Science-Backed", thumbnail: "https://img.youtube.com/vi/mpfAv1KL_YM/hqdefault.jpg" },
  { id: "OcPs3x1vX1A", title: "Fitness & Workout Video", thumbnail: "https://img.youtube.com/vi/OcPs3x1vX1A/hqdefault.jpg" },
  { id: "LhLSSNZfnQs", title: "Fitness & Workout Video", thumbnail: "https://img.youtube.com/vi/LhLSSNZfnQs/hqdefault.jpg" },
  { id: "VqXLFffiU2I", title: "Fitness & Workout Video", thumbnail: "https://img.youtube.com/vi/VqXLFffiU2I/hqdefault.jpg" },
  { id: "x6wiDew4sYU", title: "Fitness & Workout Video", thumbnail: "https://img.youtube.com/vi/x6wiDew4sYU/hqdefault.jpg" },
  { id: "Vc71YulP9Zc", title: "Fitness & Workout Video", thumbnail: "https://img.youtube.com/vi/Vc71YulP9Zc/hqdefault.jpg" },
  { id: "ChDeUAJc9bE", title: "Fitness & Workout Video", thumbnail: "https://img.youtube.com/vi/ChDeUAJc9bE/hqdefault.jpg" },
  { id: "12xHxUnBEiI", title: "Fitness & Workout Video", thumbnail: "https://img.youtube.com/vi/12xHxUnBEiI/hqdefault.jpg" },
  { id: "QVaijMZ2mp8", title: "Fitness & Workout Video", thumbnail: "https://img.youtube.com/vi/QVaijMZ2mp8/hqdefault.jpg" },
  { id: "DpIeBMgh20A", title: "Fitness & Workout Video", thumbnail: "https://img.youtube.com/vi/DpIeBMgh20A/hqdefault.jpg" },
  { id: "S5kOK3bxfro", title: "Fitness & Workout Video", thumbnail: "https://img.youtube.com/vi/S5kOK3bxfro/hqdefault.jpg" },
  { id: "3IQVNjWH60A", title: "Fitness & Workout Video", thumbnail: "https://img.youtube.com/vi/3IQVNjWH60A/hqdefault.jpg" },
  { id: "t9F9gZq42NM", title: "Fitness & Workout Video", thumbnail: "https://img.youtube.com/vi/t9F9gZq42NM/hqdefault.jpg" },
] as const

export type VideoId = (typeof VIDEOS)[number]["id"]

/** Map exercise names to embedded YouTube video IDs (no API - uses our curated list) */
export function getVideoIdForExercise(exerciseName: string): string | null {
  const name = exerciseName.toLowerCase()
  if (name.includes("walk") || name.includes("jog") || name.includes("brisk")) return "enYITYwvPAQ"
  if (name.includes("yoga") || name.includes("stretch") || name.includes("flow")) return "TJXFF0LknNs"
  if (name.includes("squat") || name.includes("hiit") || name.includes("burpee")) return "mpfAv1KL_YM"
  if (name.includes("push") || name.includes("pushup") || name.includes("press")) return "gC_L9qAHVJ8"
  if (name.includes("plank") || name.includes("core") || name.includes("ab")) return "gC_L9qAHVJ8"
  if (name.includes("lunge") || name.includes("leg")) return "mpfAv1KL_YM"
  if (name.includes("crunch") || name.includes("sit-up") || name.includes("abs")) return "gC_L9qAHVJ8"
  if (name.includes("jumping jack") || name.includes("jump")) return "mpfAv1KL_YM"
  if (name.includes("mountain climber")) return "gC_L9qAHVJ8"
  if (name.includes("dip") || name.includes("tricep")) return "gC_L9qAHVJ8"
  if (name.includes("deadlift") || name.includes("rdl") || name.includes("romanian")) return "mpfAv1KL_YM"
  if (name.includes("row") || name.includes("pull")) return "gC_L9qAHVJ8"
  if (name.includes("curl") || name.includes("bicep")) return "gC_L9qAHVJ8"
  if (name.includes("calf") || name.includes("raise")) return "gC_L9qAHVJ8"
  if (name.includes("bridge") || name.includes("glute")) return "mpfAv1KL_YM"
  if (name.includes("bird dog")) return "gC_L9qAHVJ8"
  if (name.includes("foam roll") || name.includes("recovery")) return "TJXFF0LknNs"
  if (name.includes("swim") || name.includes("bike") || name.includes("cardio")) return "cvEJ5WFk2KE"
  return "gC_L9qAHVJ8" // default: general workout
}
