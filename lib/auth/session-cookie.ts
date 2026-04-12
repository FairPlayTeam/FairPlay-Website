export const AUTH_SESSION_COOKIE = "fairplay_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
