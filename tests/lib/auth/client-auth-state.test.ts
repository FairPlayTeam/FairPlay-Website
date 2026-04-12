import assert from "node:assert/strict";
import test from "node:test";
import { resolveClientAuthState } from "../../../lib/auth/client-auth-state";
import type { User } from "../../../lib/users";

const baseUser: User = {
  id: "user_1",
  email: "hello@example.com",
  username: "hello",
  role: "user",
  isVerified: true,
  followerCount: 0,
  followingCount: 0,
  totalViews: "0",
  createdAt: "2026-01-01T00:00:00.000Z",
};

test("resolveClientAuthState returns authenticated when a user is present", () => {
  const result = resolveClientAuthState({
    user: baseUser,
    isLoading: false,
    error: null,
  });

  assert.equal(result.status, "authenticated");
  assert.equal(result.isUnavailable, false);
  assert.equal(result.errorMessage, null);
  assert.equal(result.user?.username, "hello");
});

test("resolveClientAuthState returns unavailable when auth loading fails", () => {
  const result = resolveClientAuthState({
    user: null,
    isLoading: false,
    error: new Error("connect ECONNREFUSED"),
  });

  assert.equal(result.status, "unavailable");
  assert.equal(result.isUnavailable, true);
  assert.equal(result.errorMessage, "connect ECONNREFUSED");
});
