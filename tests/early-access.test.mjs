import test from "node:test";
import assert from "node:assert/strict";
import {
  createRateLimiter,
  decideRedemption,
  normalizeCode,
  normalizeDeviceId,
} from "../src/lib/early-access/core.ts";

const DEVICE = "device-aaaa-1111";
const OTHER = "device-bbbb-2222";
const row = (over = {}) => ({ id: "row-1", locked: false, device_id: null, ...over });

test("normalizeCode uppercases and strips whitespace", () => {
  assert.equal(normalizeCode("  vhs-7kq2 mp9x \n"), "VHS-7KQ2MP9X");
});

test("normalizeCode rejects non-strings and bad lengths", () => {
  assert.equal(normalizeCode(undefined), null);
  assert.equal(normalizeCode(1234), null);
  assert.equal(normalizeCode("   "), null);
  assert.equal(normalizeCode("abc"), null);
  assert.equal(normalizeCode("A".repeat(33)), null);
  assert.equal(normalizeCode("ABCD"), "ABCD");
});

test("normalizeDeviceId enforces 8-128 chars", () => {
  assert.equal(normalizeDeviceId("short"), null);
  assert.equal(normalizeDeviceId(null), null);
  assert.equal(normalizeDeviceId("x".repeat(129)), null);
  assert.equal(normalizeDeviceId(`  ${DEVICE} `), DEVICE);
});

test("unknown code is invalid", () => {
  assert.deepEqual(decideRedemption(null, DEVICE), { kind: "rejected", reason: "invalid" });
});

test("locked code is refused, even on its own device", () => {
  assert.deepEqual(decideRedemption(row({ locked: true }), DEVICE), {
    kind: "rejected",
    reason: "locked",
  });
  assert.deepEqual(decideRedemption(row({ locked: true, device_id: DEVICE }), DEVICE), {
    kind: "rejected",
    reason: "locked",
  });
});

test("unclaimed code is claimed", () => {
  assert.deepEqual(decideRedemption(row(), DEVICE), { kind: "claim", id: "row-1" });
});

test("same device redeems again", () => {
  assert.deepEqual(decideRedemption(row({ device_id: DEVICE }), DEVICE), { kind: "valid" });
});

test("other device is refused", () => {
  assert.deepEqual(decideRedemption(row({ device_id: DEVICE }), OTHER), {
    kind: "rejected",
    reason: "already_used",
  });
});

test("rate limiter allows `limit` hits per window per key", () => {
  const allow = createRateLimiter(2, 1000);
  assert.equal(allow("ip", 0), true);
  assert.equal(allow("ip", 10), true);
  assert.equal(allow("ip", 20), false);
  assert.equal(allow("other", 20), true);
  assert.equal(allow("ip", 1000), true);
});
