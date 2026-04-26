import { getApiErrorMessage } from "../api-error";
import type { User } from "../users";

export type ClientAuthStatus = "loading" | "authenticated" | "unauthenticated" | "unavailable";

type ResolveClientAuthStateOptions = {
  user: User | null | undefined;
  isLoading: boolean;
  error: unknown;
};

export function resolveClientAuthState({ user, isLoading, error }: ResolveClientAuthStateOptions) {
  const status: ClientAuthStatus = isLoading
    ? "loading"
    : error
      ? "unavailable"
      : user
        ? "authenticated"
        : "unauthenticated";

  return {
    status,
    user: user ?? null,
    isLoading,
    isReady: !isLoading,
    isUnavailable: status === "unavailable",
    errorMessage:
      status === "unavailable"
        ? getApiErrorMessage(error, "Authentication is temporarily unavailable.")
        : null,
  };
}
