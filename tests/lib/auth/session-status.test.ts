import assert from "node:assert/strict";
import test from "node:test";
import { resolveCurrentUserSession } from "../../../lib/auth/session-status";

test("resolveCurrentUserSession returns unauthenticated when there is no session token", async () => {
  const result = await resolveCurrentUserSession({
    apiBaseUrl: "https://api.example.com",
    sessionToken: null,
  });

  assert.deepEqual(result, { status: "unauthenticated" });
});

test("resolveCurrentUserSession returns authenticated user on 200", async () => {
  let receivedUrl = "";
  let receivedHeaders: RequestInit["headers"];

  const result = await resolveCurrentUserSession({
    apiBaseUrl: "https://api.example.com/",
    sessionToken: "fp_session_token",
    fetchImpl: async (input, init) => {
      receivedUrl = input;
      receivedHeaders = init?.headers;

      return {
        ok: true,
        status: 200,
        json: async () => ({
          id: "user_1",
          email: "hello@example.com",
          username: "hello",
          role: "user",
          isVerified: true,
          followerCount: 0,
          followingCount: 0,
          totalViews: "0",
          createdAt: "2026-01-01T00:00:00.000Z",
        }),
      };
    },
  });

  assert.equal(receivedUrl, "https://api.example.com/auth/me");
  assert.deepEqual(receivedHeaders, {
    Authorization: "Bearer fp_session_token",
  });
  assert.equal(result.status, "authenticated");
  assert.equal(result.user.username, "hello");
});

test("resolveCurrentUserSession returns unauthenticated on 401", async () => {
  const result = await resolveCurrentUserSession({
    apiBaseUrl: "https://api.example.com",
    sessionToken: "expired_token",
    fetchImpl: async () => ({
      ok: false,
      status: 401,
      json: async () => ({}),
    }),
  });

  assert.deepEqual(result, { status: "unauthenticated" });
});

test("resolveCurrentUserSession returns unavailable on backend failure", async () => {
  const result = await resolveCurrentUserSession({
    apiBaseUrl: "https://api.example.com",
    sessionToken: "valid_token",
    fetchImpl: async () => ({
      ok: false,
      status: 500,
      json: async () => ({ error: "Authentication failed" }),
    }),
  });

  assert.equal(result.status, "unavailable");
  assert.equal(result.statusCode, 500);
});

test("resolveCurrentUserSession returns unavailable on network failure", async () => {
  const networkError = new Error("connect ECONNREFUSED");

  const result = await resolveCurrentUserSession({
    apiBaseUrl: "https://api.example.com",
    sessionToken: "valid_token",
    fetchImpl: async () => {
      throw networkError;
    },
  });

  assert.equal(result.status, "unavailable");
  assert.equal(result.cause, networkError);
});
