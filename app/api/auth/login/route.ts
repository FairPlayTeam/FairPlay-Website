import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getForwardedClientHeaders } from "@/lib/auth/forwarded-client-headers";
import { AUTH_SESSION_COOKIE, getSessionCookieOptions } from "@/lib/auth/session-cookie";

function getApiBaseUrl() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("env variable NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  return apiBaseUrl.replace(/\/$/, "");
}

export async function POST(request: Request) {
  const payload = await request.json();
  const headers = getForwardedClientHeaders(request.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    });
  }

  const data = (await response.json()) as { sessionKey?: string };
  if (!data.sessionKey) {
    return NextResponse.json({ error: "Missing session key in login response." }, { status: 502 });
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_SESSION_COOKIE, data.sessionKey, getSessionCookieOptions());

  return NextResponse.json({ success: true });
}
