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

async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_SESSION_COOKIE, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const headers = getForwardedClientHeaders(request.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${getApiBaseUrl()}/auth/reset-password`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const responseBody = await response.text();

  if (!response.ok) {
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    });
  }

  await clearSessionCookie();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
