import type { UserRole } from "@/lib/users";

export const AUTH_SESSION_COOKIE = "fairplay_session_hint";
export const AUTH_ROLE_COOKIE = "fairplay_role_hint";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function setCookie(name: string, value: string) {
  if (typeof document === "undefined") return;

  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${COOKIE_MAX_AGE_SECONDS}`,
    process.env.NODE_ENV === "production" ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=; Path=/; SameSite=Lax; Max-Age=0${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
}

export function syncSessionCookie(token: string | null) {
  if (token) {
    setCookie(AUTH_SESSION_COOKIE, token);
    return;
  }

  clearCookie(AUTH_SESSION_COOKIE);
}

export function syncRoleCookie(role: UserRole | null) {
  if (role) {
    setCookie(AUTH_ROLE_COOKIE, role);
    return;
  }

  clearCookie(AUTH_ROLE_COOKIE);
}

export function clearAuthCookies() {
  syncSessionCookie(null);
  syncRoleCookie(null);
}
