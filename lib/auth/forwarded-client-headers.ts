type HeaderSource = Pick<Headers, "get">;

const FORWARDED_CLIENT_HEADER_NAMES = [
  "user-agent",
  "x-forwarded-for",
  "x-real-ip",
  "x-forwarded-proto",
  "x-forwarded-host",
] as const;

export function getForwardedClientHeaders(headers: HeaderSource) {
  const nextHeaders = new Headers();

  for (const name of FORWARDED_CLIENT_HEADER_NAMES) {
    const value = headers.get(name);

    if (value) {
      nextHeaders.set(name, value);
    }
  }

  return nextHeaders;
}
