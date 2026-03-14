import { useAuthStore } from '@/lib/stores/auth'

export function getToken(): string | null {
  return useAuthStore.getState().token
}

export function setToken(token: string): void {
  const normalizedToken = token.trim()
  useAuthStore.getState().setToken(normalizedToken.length > 0 ? normalizedToken : null)
}

export function clearToken(): void {
  useAuthStore.getState().clearToken()
}
