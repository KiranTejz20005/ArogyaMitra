/**
 * Frontend API config. Backend base URL from environment.
 * - Client (browser): NEXT_PUBLIC_BACKEND_URL
 * - Server (SSR/API routes): BACKEND_URL or NEXT_PUBLIC_BACKEND_URL
 */

function getBackendUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
  }
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
}

export const API_CONFIG = {
  getBackendUrl,
  defaultBackendUrl: "http://localhost:8000",
} as const
