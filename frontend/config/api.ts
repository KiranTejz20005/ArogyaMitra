/**
 * Frontend API config. Backend base URL from environment.
 * Use NEXT_PUBLIC_API_URL (and API_URL for server-side). Do not hardcode localhost.
 */

function getBackendUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL
  if (url) return url
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:8000"
  }
  throw new Error(
    "Missing API URL: set NEXT_PUBLIC_API_URL (e.g. https://your-api.onrender.com)"
  )
}

export const API_CONFIG = {
  getBackendUrl,
} as const
