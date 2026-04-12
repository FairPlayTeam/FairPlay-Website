import { redirect } from "next/navigation";
import { buildAuthHref, buildServiceUnavailableHref } from "@/lib/safe-redirect";
import { isAuthServiceUnavailableError } from "@/lib/auth/session-status";
import { getCurrentUserServer } from "@/lib/auth/server-session";
import type { UserRole } from "@/lib/users";

export async function requireAuthenticatedUser(callbackUrl: string) {
  let user: Awaited<ReturnType<typeof getCurrentUserServer>>;

  try {
    user = await getCurrentUserServer();
  } catch (error) {
    if (isAuthServiceUnavailableError(error)) {
      redirect(buildServiceUnavailableHref(callbackUrl));
    }

    throw error;
  }

  if (!user) {
    redirect(buildAuthHref("/login", callbackUrl));
  }

  return user;
}

export async function requireAuthorizedRole(
  roles: UserRole[],
  callbackUrl: string,
  fallbackUrl = "/explore",
) {
  let user: Awaited<ReturnType<typeof getCurrentUserServer>>;

  try {
    user = await getCurrentUserServer();
  } catch (error) {
    if (isAuthServiceUnavailableError(error)) {
      redirect(buildServiceUnavailableHref(callbackUrl));
    }

    throw error;
  }

  if (!user) {
    redirect(buildAuthHref("/login", callbackUrl));
  }

  if (!roles.includes(user.role)) {
    redirect(fallbackUrl);
  }

  return user;
}
