/**
 * Cash on Delivery: pure helpers with no framework or database imports, so
 * they can be unit-tested directly with `node --test` (type stripping).
 */
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

/** Flat fee added to every COD order, in rupees. */
export const COD_FEE = 100;

/** Abuse limits for COD orders. */
export const COD_MAX_UNITS = 3;
export const COD_MAX_ORDERS_PER_PHONE_24H = 2;
export const COD_MAX_ORDERS_PER_EMAIL_24H = 2;
export const COD_MAX_ORDERS_PER_IP_24H = 5;

/** OTP rules. */
export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_SECONDS = 60;
/** Max codes per phone / email address per hour. */
export const OTP_MAX_PER_PHONE_HOUR = 5;
export const OTP_MAX_PER_IP_HOUR = 10;
export const OTP_TOKEN_TTL_MINUTES = 15;

/**
 * Normalises an Indian mobile number to its 10 digits, or null when it isn't
 * one. Accepts `98765 43210`, `+91 98765-43210`, `919876543210`, `09876543210`.
 */
export function normalizeIndianMobile(value: unknown): string | null {
  let d = String(value ?? "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

/** A 6-digit numeric OTP from a CSPRNG. */
export function generateOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** Keyed hash of an OTP, bound to the phone/email so a hash can't be replayed for another contact. */
export function hashOtp(secret: string, contact: string, code: string): string {
  return createHmac("sha256", secret).update(`otp|${contact}|${code}`).digest("hex");
}

export function safeEqualHex(a: string, b: string): boolean {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ab.length === bb.length && ab.length > 0 && timingSafeEqual(ab, bb);
}

// ── Verification token ──────────────────────────────────────────────────────
// Issued once the OTP is verified; createOrder accepts it once. It carries the
// verified identity (the email, or the phone for SMS), so it can't be reused
// for a different contact. Format: base64url(JSON {i: otpId, s: identity,
// e: expiryMs}) + "." + hmac. JSON, not a "." split, because emails contain dots.

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64url");
const unb64 = (s: string) => Buffer.from(s, "base64url").toString("utf8");
const sign = (secret: string, body: string) =>
  createHmac("sha256", secret).update(`token|${body}`).digest("base64url");

export function signOtpToken(
  secret: string,
  otpId: string,
  identity: string,
  now: Date = new Date(),
): string {
  const exp = now.getTime() + OTP_TOKEN_TTL_MINUTES * 60_000;
  const body = b64(JSON.stringify({ i: otpId, s: identity, e: exp }));
  return `${body}.${sign(secret, body)}`;
}

export type TokenCheck =
  | { ok: true; otpId: string; identity: string }
  | { ok: false; reason: string };

export function verifyOtpToken(
  secret: string,
  token: unknown,
  expectedIdentity: string,
  now: Date = new Date(),
): TokenCheck {
  if (typeof token !== "string" || !token.includes(".")) {
    return { ok: false, reason: "Verification is missing" };
  }
  const [body, mac] = token.split(".", 2) as [string, string];
  const expected = sign(secret, body);
  const a = Buffer.from(mac ?? "");
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "Verification is invalid" };
  }
  let parsed: { i?: unknown; s?: unknown; e?: unknown };
  try {
    parsed = JSON.parse(unb64(body));
  } catch {
    return { ok: false, reason: "Verification is invalid" };
  }
  const { i: otpId, s: identity, e: exp } = parsed;
  if (typeof otpId !== "string" || typeof identity !== "string" || typeof exp !== "number") {
    return { ok: false, reason: "Verification is invalid" };
  }
  if (now.getTime() > exp) {
    return { ok: false, reason: "Verification expired, please verify again" };
  }
  if (identity !== expectedIdentity) {
    return { ok: false, reason: "Verified contact does not match the order" };
  }
  return { ok: true, otpId, identity };
}

// ── Email helpers ───────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Lowercase + trim: the form an email is stored and verified under. */
export function cleanEmail(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export function isValidEmail(value: unknown): boolean {
  const e = cleanEmail(value);
  return e.length <= 254 && EMAIL_RE.test(e);
}

/**
 * Key for limits: the same inbox written different ways maps to one value
 * (`J.Doe+x@gmail.com` and `jdoe@gmail.com` are the same mailbox).
 */
export function normalizeEmail(value: unknown): string {
  const e = cleanEmail(value);
  const at = e.lastIndexOf("@");
  if (at < 1) return e;
  let local = e.slice(0, at);
  let domain = e.slice(at + 1);
  const plus = local.indexOf("+");
  if (plus > 0) local = local.slice(0, plus);
  if (domain === "googlemail.com") domain = "gmail.com";
  if (domain === "gmail.com") local = local.replace(/\./g, "");
  return `${local}@${domain}`;
}

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org", "sharklasers.com",
  "10minutemail.com", "10minutemail.net", "tempmail.com", "temp-mail.org", "temp-mail.io",
  "yopmail.com", "yopmail.net", "trashmail.com", "throwawaymail.com", "getnada.com",
  "maildrop.cc", "dispostable.com", "fakeinbox.com", "mailnesia.com", "mintemail.com",
  "moakt.com", "tempail.com", "emailondeck.com", "mohmal.com", "burnermail.io",
  "tempmailo.com", "mytemp.email", "spamgourmet.com", "tmpmail.org", "mail.tm",
]);

export function isDisposableEmail(value: unknown): boolean {
  const e = cleanEmail(value);
  const domain = e.slice(e.lastIndexOf("@") + 1);
  return DISPOSABLE_DOMAINS.has(domain);
}

// ── Which contact is being verified ─────────────────────────────────────────

export type OtpChannel = "email" | "sms";

export type ContactCheck =
  | { ok: true; contact: string }
  | { ok: false; message: string };

/** Validates and normalises the contact for the active channel. */
export function parseContact(
  channel: OtpChannel,
  input: { email?: unknown; phone?: unknown },
): ContactCheck {
  if (channel === "sms") {
    const phone = normalizeIndianMobile(input.phone);
    return phone
      ? { ok: true, contact: phone }
      : { ok: false, message: "Enter a valid 10-digit Indian mobile number" };
  }
  if (!isValidEmail(input.email)) return { ok: false, message: "Enter a valid email address" };
  if (isDisposableEmail(input.email)) {
    return { ok: false, message: "Please use a permanent email address, not a temporary one" };
  }
  return { ok: true, contact: cleanEmail(input.email) };
}

// ── COD order ids ───────────────────────────────────────────────────────────

const ID_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * `order_COD` + 12 random chars. Keeps the `order_` prefix so every existing
 * lookup (success page, track-order, `VHSMO-` mapping) works unchanged; it
 * becomes `VHSMO-COD…` in EasyEcom.
 */
export function generateCodOrderId(): string {
  let s = "";
  for (let i = 0; i < 12; i++) s += ID_CHARS[randomInt(0, ID_CHARS.length)];
  return `order_COD${s}`;
}

export function isCodOrderId(id: unknown): boolean {
  return typeof id === "string" && /^order_COD[A-Z0-9]{12}$/.test(id);
}

// ── Pricing ─────────────────────────────────────────────────────────────────

/**
 * Total for a COD order: the cart after any coupon, plus the COD fee. The fee
 * is added after the discount, so a coupon can never reduce it.
 */
export function codTotal(p: {
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount?: number;
}): number {
  return Math.max(0, p.subtotal + p.shippingCost + p.tax - (p.discount ?? 0)) + COD_FEE;
}
