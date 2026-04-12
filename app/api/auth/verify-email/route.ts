import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getForwardedClientHeaders } from "@/lib/auth/forwarded-client-headers";
import { AUTH_SESSION_COOKIE, getSessionCookieOptions } from "@/lib/auth/session-cookie";

function getApiBaseUrl() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("env variable NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  return apiBaseUrl.replace(/\/$/, "");
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing verification token." }, { status: 400 });
  }

  const headers = getForwardedClientHeaders(request.headers);

  const response = await fetch(
    `${getApiBaseUrl()}/auth/verify-email?token=${encodeURIComponent(token)}`,
    {
      method: "GET",
      headers,
    },
  );

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
    return NextResponse.json(
      { error: "Missing session key in verification response." },
      { status: 502 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_SESSION_COOKIE, data.sessionKey, getSessionCookieOptions());

  return NextResponse.json({ success: true });
}
