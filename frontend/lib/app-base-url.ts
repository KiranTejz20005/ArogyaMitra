/**
 * Base URL of this app for server-side fetch to own API routes.
 * Use for dashboard pages that call /api/backend/* with cookies.
 * Vercel sets NEXT_PUBLIC_VERCEL_URL and VERCEL_URL; avoid throwing so dashboard always loads.
 */
export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`.replace(/\/$/, "")
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "")
  }
  if (process.env.NODE_ENV === "development") {
    return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "")
  }
  return "http://localhost:3000"
}
