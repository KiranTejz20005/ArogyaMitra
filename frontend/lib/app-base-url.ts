/**
 * Base URL of this app for server-side fetch to own API routes.
 * Use for dashboard pages that call /api/backend/* with cookies.
 */
export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}
