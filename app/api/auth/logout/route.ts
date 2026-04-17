import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_SESSION_COOKIE, getSessionCookieOptions } from "@/lib/auth/session-cookie";

type Session = {
  id: string;
  isCurrent?: boolean;
};

type RevokeResult =
  | { ok: true }
  | {
      ok: false;
      status: number;
      message: string;
    };

function getApiBaseUrl() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("env variable NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  return apiBaseUrl.replace(/\/$/, "");
}

async function revokeCurrentBackendSession(token: string) {
  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };
  const apiBaseUrl = getApiBaseUrl();

  let sessionsResponse: Response;

  try {
    sessionsResponse = await fetch(`${apiBaseUrl}/auth/sessions`, {
      cache: "no-store",
      headers: authHeaders,
    });
  } catch {
    return {
      ok: false,
      status: 503,
      message: "Authentication service is temporarily unavailable. Please try again.",
    } satisfies RevokeResult;
  }

  if (sessionsResponse.status === 401) {
    return { ok: true } satisfies RevokeResult;
  }

  if (!sessionsResponse.ok) {
    return {
      ok: false,
      status: sessionsResponse.status >= 500 ? 503 : sessionsResponse.status,
      message: "Unable to revoke the current session right now. Please try again.",
    } satisfies RevokeResult;
  }

  let data: { sessions?: Session[] };

  try {
    data = (await sessionsResponse.json()) as { sessions?: Session[] };
  } catch {
    return {
      ok: false,
      status: 502,
      message: "Received an invalid session response from the authentication service.",
    } satisfies RevokeResult;
  }

  const currentSession = data.sessions?.find((session) => session.isCurrent);

  if (!currentSession) {
    return { ok: true } satisfies RevokeResult;
  }

  let revokeResponse: Response;

  try {
    revokeResponse = await fetch(
      `${apiBaseUrl}/auth/sessions/${encodeURIComponent(currentSession.id)}`,
      {
        method: "DELETE",
        headers: authHeaders,
      },
    );
  } catch {
    return {
      ok: false,
      status: 503,
      message: "Authentication service is temporarily unavailable. Please try again.",
    } satisfies RevokeResult;
  }

  if (revokeResponse.status === 401 || revokeResponse.status === 404) {
    return { ok: true } satisfies RevokeResult;
  }

  if (!revokeResponse.ok) {
    return {
      ok: false,
      status: revokeResponse.status >= 500 ? 503 : revokeResponse.status,
      message: "Unable to revoke the current session right now. Please try again.",
    } satisfies RevokeResult;
  }

  return { ok: true } satisfies RevokeResult;
}

async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_SESSION_COOKIE, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
}

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_SESSION_COOKIE)?.value?.trim();

  if (token) {
    const revokeResult = await revokeCurrentBackendSession(token);

    if (!revokeResult.ok) {
      return NextResponse.json({ error: revokeResult.message }, { status: revokeResult.status });
    }
  }

  await clearSessionCookie();

  return NextResponse.json({ success: true });
}
