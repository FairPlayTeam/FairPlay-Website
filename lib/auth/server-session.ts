import "server-only";

import { cookies } from "next/headers";
import type { User } from "@/lib/users";
import { AUTH_SESSION_COOKIE } from "@/lib/auth/session-cookie";
import { AuthServiceUnavailableError, resolveCurrentUserSession } from "@/lib/auth/session-status";

function getApiBaseUrl() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("env variable NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  return apiBaseUrl.replace(/\/$/, "");
}

export async function getServerSessionToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_SESSION_COOKIE)?.value?.trim();

  return token || null;
}

export async function getCurrentUserServer(): Promise<User | null> {
  const sessionToken = await getServerSessionToken();
  const session = await resolveCurrentUserSession({
    apiBaseUrl: getApiBaseUrl(),
    sessionToken,
  });

  if (session.status === "authenticated") {
    return session.user;
  }

  if (session.status === "unauthenticated") {
    return null;
  }

  throw new AuthServiceUnavailableError(undefined, {
    statusCode: session.statusCode,
    cause: session.cause,
  });
}
