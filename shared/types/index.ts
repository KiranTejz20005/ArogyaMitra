/**
 * Shared types used by frontend and backend (documentation / future use).
 * Backend is Python; frontend uses TypeScript. Keep API contracts here for reference.
 */

export type ApiUser = {
  id: number
  email: string
  full_name: string | null
  is_active: boolean
}

export type AuthTokenResponse = {
  access_token: string
  token_type: string
}
