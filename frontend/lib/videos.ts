/**
 * Curated YouTube embed list – no YouTube Data API.
 * All videos are embedded via iframe (see /videos page and YouTubePlayerWithControls).
 *
 * Embedded videos:
 * 1. enYITYwvPAQ – FAST Walking in 30 minutes | Fitness Videos
 * 2. cvEJ5WFk2KE – 30 Minute Boosted Fitness Walk | Walk at Home
 * 3. TJXFF0LknNs – 15 Minutes Yoga for Beginners | Simple Home Practice
 * 4. gC_L9qAHVJ8 – 30 Min Fat Burning Home Workout for Beginners
 * 5. mpfAv1KL_YM – 5 Minutes = 45 Min of Jogging | Science-Backed
 */
export const VIDEOS = [
  {
    id: "enYITYwvPAQ",
    title: "FAST Walking in 30 minutes | Fitness Videos",
    thumbnail: "https://img.youtube.com/vi/enYITYwvPAQ/hqdefault.jpg",
  },
  {
    id: "cvEJ5WFk2KE",
    title: "30 Minute Boosted Fitness Walk | Walk at Home",
    thumbnail: "https://img.youtube.com/vi/cvEJ5WFk2KE/hqdefault.jpg",
  },
  {
    id: "TJXFF0LknNs",
    title: "15 Minutes Yoga for Beginners | Simple Home Practice",
    thumbnail: "https://img.youtube.com/vi/TJXFF0LknNs/hqdefault.jpg",
  },
  {
    id: "gC_L9qAHVJ8",
    title: "30 Min Fat Burning Home Workout for Beginners",
    thumbnail: "https://img.youtube.com/vi/gC_L9qAHVJ8/hqdefault.jpg",
  },
  {
    id: "mpfAv1KL_YM",
    title: "5 Minutes = 45 Min of Jogging | Science-Backed",
    thumbnail: "https://img.youtube.com/vi/mpfAv1KL_YM/hqdefault.jpg",
  },
] as const

export type VideoId = (typeof VIDEOS)[number]["id"]

/** Map exercise names to embedded YouTube video IDs (no API - uses our curated list) */
export function getVideoIdForExercise(exerciseName: string): string | null {
  const name = exerciseName.toLowerCase()
  if (name.includes("walk") || name.includes("jog")) return "enYITYwvPAQ"
  if (name.includes("yoga") || name.includes("stretch")) return "TJXFF0LknNs"
  if (name.includes("squat") || name.includes("hiit") || name.includes("burpee"))
    return "mpfAv1KL_YM"
  return "gC_L9qAHVJ8" // default: general workout
}
