import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { AUTH_SESSION_COOKIE } from "@/lib/auth/session-cookie";

export const runtime = "nodejs";

function getApiBaseUrl() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("env variable NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  return apiBaseUrl.replace(/\/$/, "");
}

function getResponseHeaders(headers: Headers) {
  const nextHeaders = new Headers(headers);
  nextHeaders.delete("content-length");
  nextHeaders.delete("content-encoding");
  nextHeaders.delete("transfer-encoding");
  nextHeaders.delete("connection");
  nextHeaders.delete("set-cookie");
  return nextHeaders;
}

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_SESSION_COOKIE)?.value?.trim();
  const pathname = path.map(encodeURIComponent).join("/");
  const targetUrl = `${getApiBaseUrl()}/${pathname}${request.nextUrl.search}`;
  const headers = new Headers();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const upstreamResponse = await fetch(targetUrl, {
    headers,
  });

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: getResponseHeaders(upstreamResponse.headers),
  });
}
