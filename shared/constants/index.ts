/**
 * Shared constants (e.g. API route names, cookie names).
 * Frontend can import these; backend uses its own constants.
 */

export const AUTH_COOKIE_NAME = "arogyamitra_token"

export const API_PATHS = {
  AUTH_LOGIN: "/auth/login",
  AUTH_REGISTER: "/auth/register",
  AUTH_ME: "/auth/me",
  WORKOUTS: "/workouts",
  NUTRITION: "/nutrition",
  PROGRESS: "/progress",
  HEALTH: "/health",
  AROMI_CHAT: "/aromi/chat",
} as const
