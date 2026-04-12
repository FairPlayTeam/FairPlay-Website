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

function buildTargetUrl(path: string[], search: string) {
  const pathname = path.map(encodeURIComponent).join("/");
  return `${getApiBaseUrl()}/${pathname}${search}`;
}

function getForwardHeaders(headers: Headers, token: string | null) {
  const nextHeaders = new Headers(headers);
  nextHeaders.delete("host");
  nextHeaders.delete("cookie");
  nextHeaders.delete("authorization");

  if (token) {
    nextHeaders.set("Authorization", `Bearer ${token}`);
  }

  return nextHeaders;
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

async function forwardRequest(request: NextRequest, path: string[]) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_SESSION_COOKIE)?.value?.trim() ?? null;
  const targetUrl = buildTargetUrl(path, request.nextUrl.search);
  const method = request.method.toUpperCase();

  const upstreamResponse = await fetch(targetUrl, {
    method,
    headers: getForwardHeaders(request.headers, token),
    body: method === "GET" || method === "HEAD" ? undefined : request.body,
    duplex: method === "GET" || method === "HEAD" ? undefined : "half",
  } as RequestInit & { duplex?: "half" });

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: getResponseHeaders(upstreamResponse.headers),
  });
}

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return forwardRequest(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return forwardRequest(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return forwardRequest(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return forwardRequest(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return forwardRequest(request, path);
}
