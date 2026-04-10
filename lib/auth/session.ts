import { clearAuthCookies, syncSessionCookie } from "@/lib/auth/cookies";
import { useAuthStore } from "@/lib/stores/auth";

export function getSessionToken(): string | null {
  return useAuthStore.getState().token;
}

export function setSessionToken(token: string): void {
  const normalizedToken = token.trim();
  const nextToken = normalizedToken.length > 0 ? normalizedToken : null;
  useAuthStore.getState().setToken(nextToken);
  syncSessionCookie(nextToken);
}

export function clearSessionToken(): void {
  useAuthStore.getState().clearToken();
  clearAuthCookies();
}
