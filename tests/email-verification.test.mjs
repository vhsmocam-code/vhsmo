import test from "node:test";
import assert from "node:assert/strict";
import {
  signOtpToken, verifyOtpToken, parseContact, OTP_TOKEN_TTL_MINUTES,
} from "../src/lib/cod/core.ts";

const SECRET = "test-secret-0123456789abcdef";

test("an email token verifies repeatedly (online payment retries) until it expires", () => {
  const now = new Date("2026-11-25T10:00:00Z");
  const token = signOtpToken(SECRET, "otp-1", "buyer@gmail.com", now);
  const t1 = verifyOtpToken(SECRET, token, "buyer@gmail.com", new Date(now.getTime() + 60_000));
  const t2 = verifyOtpToken(SECRET, token, "buyer@gmail.com", new Date(now.getTime() + 600_000));
  assert.equal(t1.ok, true);
  assert.equal(t2.ok, true);
  const late = verifyOtpToken(SECRET, token, "buyer@gmail.com", new Date(now.getTime() + (OTP_TOKEN_TTL_MINUTES + 1) * 60_000));
  assert.equal(late.ok, false);
  assert.match(late.reason, /expired/i);
});

test("a token only works for the address it was issued to", () => {
  const token = signOtpToken(SECRET, "otp-2", "buyer@gmail.com");
  const other = verifyOtpToken(SECRET, token, "someone.else@gmail.com");
  assert.equal(other.ok, false);
  assert.match(other.reason, /does not match/i);
});

test("missing or tampered tokens are rejected", () => {
  assert.equal(verifyOtpToken(SECRET, undefined, "a@b.co").ok, false);
  const token = signOtpToken(SECRET, "otp-3", "a@b.co");
  assert.equal(verifyOtpToken(SECRET, token.slice(0, -2) + "xx", "a@b.co").ok, false);
  assert.equal(verifyOtpToken("a-different-secret-0123456789", token, "a@b.co").ok, false);
});

test("checkout email parsing normalises case and blocks temporary inboxes", () => {
  assert.deepEqual(parseContact("email", { email: "  Buyer@Gmail.com " }), { ok: true, contact: "buyer@gmail.com" });
  assert.equal(parseContact("email", { email: "nope" }).ok, false);
  const temp = parseContact("email", { email: "x@mailinator.com" });
  assert.equal(temp.ok, false);
  assert.match(temp.message, /permanent email/i);
});
