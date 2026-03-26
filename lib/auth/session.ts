import { useAuthStore } from "@/lib/stores/auth";

export function getSessionToken(): string | null {
  return useAuthStore.getState().token;
}

export function setSessionToken(token: string): void {
  const normalizedToken = token.trim();
  useAuthStore.getState().setToken(normalizedToken.length > 0 ? normalizedToken : null);
}

export function clearSessionToken(): void {
  useAuthStore.getState().clearToken();
}
