import { useAuthStore } from "@/lib/stores/auth";

export function getToken(): string | null {
  return useAuthStore.getState().token;
}

export function setToken(token: string): void {
  useAuthStore.getState().setToken(token);
}

export function clearToken(): void {
  useAuthStore.getState().clearToken();
}
