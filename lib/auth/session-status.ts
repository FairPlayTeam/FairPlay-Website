import type { User } from "@/lib/users";

type SessionFetchResponse = Pick<Response, "json" | "ok" | "status">;
type SessionFetch = (input: string, init?: RequestInit) => Promise<SessionFetchResponse>;

export type CurrentUserSessionStatus =
  | {
      status: "authenticated";
      user: User;
    }
  | {
      status: "unauthenticated";
    }
  | {
      status: "unavailable";
      statusCode?: number;
      cause?: unknown;
    };

type ResolveCurrentUserSessionOptions = {
  apiBaseUrl: string;
  sessionToken: string | null | undefined;
  fetchImpl?: SessionFetch;
};

export class AuthServiceUnavailableError extends Error {
  statusCode?: number;
  cause?: unknown;

  constructor(
    message = "Authentication service is temporarily unavailable.",
    options: { statusCode?: number; cause?: unknown } = {},
  ) {
    super(message);
    this.name = "AuthServiceUnavailableError";
    this.statusCode = options.statusCode;
    this.cause = options.cause;
  }
}

export function isAuthServiceUnavailableError(
  error: unknown,
): error is AuthServiceUnavailableError {
  return error instanceof AuthServiceUnavailableError;
}

function normalizeApiBaseUrl(apiBaseUrl: string) {
  return apiBaseUrl.replace(/\/$/, "");
}

export async function resolveCurrentUserSession({
  apiBaseUrl,
  sessionToken,
  fetchImpl = fetch,
}: ResolveCurrentUserSessionOptions): Promise<CurrentUserSessionStatus> {
  if (!sessionToken) {
    return { status: "unauthenticated" };
  }

  let response: SessionFetchResponse;

  try {
    response = await fetchImpl(`${normalizeApiBaseUrl(apiBaseUrl)}/auth/me`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });
  } catch (cause) {
    return { status: "unavailable", cause };
  }

  if (response.status === 401) {
    return { status: "unauthenticated" };
  }

  if (!response.ok) {
    return { status: "unavailable", statusCode: response.status };
  }

  try {
    return {
      status: "authenticated",
      user: (await response.json()) as User,
    };
  } catch (cause) {
    return {
      status: "unavailable",
      statusCode: response.status,
      cause,
    };
  }
}
