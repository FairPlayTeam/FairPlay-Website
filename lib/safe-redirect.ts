const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;
const BLOCKED_PREFIXES = ["/login", "/register"];
type AuthPath = "/login" | "/register";

export function getSafeCallbackUrl(
  callbackUrl: string | null | undefined,
  fallback = "/explore",
): string {
  if (!callbackUrl) return fallback;

  const normalized = callbackUrl.trim();
  if (!normalized) return fallback;
  if (!normalized.startsWith("/")) return fallback;
  if (normalized.startsWith("//")) return fallback;
  if (normalized.includes("\\")) return fallback;
  if (CONTROL_CHARS.test(normalized)) return fallback;
  if (
    BLOCKED_PREFIXES.some(
      (prefix) =>
        normalized === prefix ||
        normalized.startsWith(`${prefix}/`) ||
        normalized.startsWith(`${prefix}?`) ||
        normalized.startsWith(`${prefix}#`),
    )
  ) {
    return fallback;
  }

  return normalized;
}

export function buildAuthHref(path: AuthPath, callbackUrl?: string | null): string {
  const safeCallbackUrl = getSafeCallbackUrl(callbackUrl, "");

  if (!safeCallbackUrl) {
    return path;
  }

  return `${path}?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`;
}

export function buildServiceUnavailableHref(callbackUrl?: string | null): string {
  const safeCallbackUrl = getSafeCallbackUrl(callbackUrl);

  return `/service-unavailable?from=${encodeURIComponent(safeCallbackUrl)}`;
}
