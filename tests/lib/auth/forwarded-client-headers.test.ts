import assert from "node:assert/strict";
import test from "node:test";
import { getForwardedClientHeaders } from "../../../lib/auth/forwarded-client-headers";

test("getForwardedClientHeaders keeps only safe client metadata headers", () => {
  const headers = new Headers({
    Authorization: "Bearer should-not-pass",
    Cookie: "session=blocked",
    "User-Agent": "FairPlay Browser",
    "X-Forwarded-For": "203.0.113.10",
    "X-Real-Ip": "203.0.113.11",
    "X-Forwarded-Proto": "https",
    "X-Forwarded-Host": "fairplay.video",
  });

  const result = getForwardedClientHeaders(headers);
  const entries: Array<[string, string]> = [];
  result.forEach((value, key) => {
    entries.push([key, value]);
  });

  assert.deepEqual(entries.sort(), [
    ["user-agent", "FairPlay Browser"],
    ["x-forwarded-for", "203.0.113.10"],
    ["x-forwarded-host", "fairplay.video"],
    ["x-forwarded-proto", "https"],
    ["x-real-ip", "203.0.113.11"],
  ]);
});
