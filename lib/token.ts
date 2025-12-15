export const KEY = "auth-session-key";

let cached: string | null | undefined;

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  if (cached !== undefined) return cached;
  const v = localStorage.getItem(KEY);
  cached = v;
  return v;
}

export function setToken(value: string): void {
  if (typeof window === "undefined") return;
  cached = value;
  localStorage.setItem(KEY, value);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  cached = null;
  localStorage.removeItem(KEY);
}

export function getCachedToken(): string | null {
  return cached ?? null;
}
