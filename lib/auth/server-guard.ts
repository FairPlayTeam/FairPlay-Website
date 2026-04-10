import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_ROLE_COOKIE, AUTH_SESSION_COOKIE } from "@/lib/auth/cookies";
import { buildAuthHref } from "@/lib/safe-redirect";
import type { UserRole } from "@/lib/users";

export async function requireAuthenticatedUser(callbackUrl: string) {
  const cookieStore = await cookies();
  const sessionHint = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

  if (!sessionHint) {
    redirect(buildAuthHref("/login", callbackUrl));
  }
}

export async function requireAuthorizedRole(
  roles: UserRole[],
  callbackUrl: string,
  fallbackUrl = "/explore",
) {
  const cookieStore = await cookies();
  const sessionHint = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

  if (!sessionHint) {
    redirect(buildAuthHref("/login", callbackUrl));
  }

  const roleHint = cookieStore.get(AUTH_ROLE_COOKIE)?.value as UserRole | undefined;
  if (!roleHint || !roles.includes(roleHint)) {
    redirect(fallbackUrl);
  }
}
