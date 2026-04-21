import { NextResponse } from "next/server";
import { getForwardedClientHeaders } from "@/lib/auth/forwarded-client-headers";

function getApiBaseUrl() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("env variable NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  return apiBaseUrl.replace(/\/$/, "");
}

export async function POST(request: Request) {
  const payload = await request.json();
  const headers = getForwardedClientHeaders(request.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${getApiBaseUrl()}/auth/forgot-password`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
