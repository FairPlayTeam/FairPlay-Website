import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAuthHref,
  buildServiceUnavailableHref,
  getSafeCallbackUrl,
} from "../../lib/safe-redirect";

test("getSafeCallbackUrl keeps valid internal callbacks", () => {
  assert.equal(getSafeCallbackUrl("/video/123?t=45"), "/video/123?t=45");
});

test("getSafeCallbackUrl rejects unsafe callbacks", () => {
  assert.equal(getSafeCallbackUrl("https://evil.example"), "/explore");
  assert.equal(getSafeCallbackUrl("//evil.example"), "/explore");
  assert.equal(getSafeCallbackUrl("/login?callbackUrl=/admin"), "/explore");
  assert.equal(getSafeCallbackUrl("/video\\123"), "/explore");
});

test("buildAuthHref encodes safe callback urls", () => {
  assert.equal(
    buildAuthHref("/login", "/video/123?t=45"),
    "/login?callbackUrl=%2Fvideo%2F123%3Ft%3D45",
  );
});

test("buildServiceUnavailableHref preserves safe retry targets", () => {
  assert.equal(buildServiceUnavailableHref("/profile"), "/service-unavailable?from=%2Fprofile");
});
