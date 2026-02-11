/**
 * ArogyaMitra FastAPI backend client.
 * Base URL from config (reads NEXT_PUBLIC_BACKEND_URL / BACKEND_URL).
 */

import { API_CONFIG } from "@/config/api"

const getBaseUrl = () => API_CONFIG.getBackendUrl()

const TOKEN_COOKIE = "arogyamitra_token"

export function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null
  const match = cookieHeader.match(new RegExp(`${TOKEN_COOKIE}=([^;]+)`))
  return match ? decodeURIComponent(match[1]) : null
}

export async function fetchBackend(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<Response> {
  const { token, ...rest } = options
  const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(rest.headers as Record<string, string>),
  }
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
  return fetch(url, { ...rest, headers })
}

// Auth
export async function loginBackend(email: string, password: string) {
  const r = await fetchBackend("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
  if (!r.ok) {
    const d = await r.json().catch(() => ({}))
    throw new Error((d.detail as string) || "Login failed")
  }
  return r.json() as Promise<{ access_token: string; token_type: string }>
}

export async function registerBackend(email: string, password: string, full_name?: string) {
  const r = await fetchBackend("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name }),
  })
  if (!r.ok) {
    const d = await r.json().catch(() => ({}))
    throw new Error((d.detail as string) || "Sign up failed")
  }
  return r.json() as Promise<{ access_token: string; token_type: string }>
}

export async function getMeBackend(token: string) {
  const r = await fetchBackend("/auth/me", { token })
  if (!r.ok) return null
  return r.json() as Promise<{ id: number; email: string; full_name: string | null; is_active: boolean }>
}

// Re-export for middleware/layout
export { TOKEN_COOKIE }
