/**
 * Base URL of this app for server-side fetch to own API routes.
 * Use for dashboard pages that call /api/backend/* with cookies.
 * Set NEXT_PUBLIC_APP_URL in production (e.g. Render); Vercel uses NEXT_PUBLIC_VERCEL_URL.
 */
export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }
  if (process.env.NODE_ENV === "development") {
    return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  }
  throw new Error(
    "Missing app URL: set NEXT_PUBLIC_APP_URL (e.g. https://your-app.onrender.com)"
  )
}
