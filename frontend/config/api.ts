/**
 * Frontend API config. Backend base URL from environment.
 * Use NEXT_PUBLIC_API_URL (and API_URL for server-side). Do not hardcode localhost.
 * Production fallback so Vercel + Render work when env is not set.
 */
const DEFAULT_PRODUCTION_API_URL = "https://arogyamitra-657d.onrender.com"

function getBackendUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL
  if (url) return url.replace(/\/$/, "") // no trailing slash
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:8000"
  }
  return DEFAULT_PRODUCTION_API_URL
}

export const API_CONFIG = {
  getBackendUrl,
} as const
