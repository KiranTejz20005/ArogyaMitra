const AVATAR_STORAGE_KEY = "arogyamitra_avatar_url"
export const AVATAR_UPDATED_EVENT = "arogyamitra_avatar_updated"

export function getStoredAvatarUrl(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(AVATAR_STORAGE_KEY)
}

export function setStoredAvatarUrl(url: string | null): void {
  if (typeof window === "undefined") return
  if (url) {
    localStorage.setItem(AVATAR_STORAGE_KEY, url)
  } else {
    localStorage.removeItem(AVATAR_STORAGE_KEY)
  }
  window.dispatchEvent(new CustomEvent(AVATAR_UPDATED_EVENT))
}
