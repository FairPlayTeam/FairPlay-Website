import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_SESSION_COOKIE, getSessionCookieOptions } from "@/lib/auth/session-cookie";

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_SESSION_COOKIE, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });

  return NextResponse.json({ success: true });
}
