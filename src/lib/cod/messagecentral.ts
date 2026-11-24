import { messageCentralConfig } from "./config";
import {
  parseSendResponse,
  parseTokenResponse,
  parseValidateResponse,
  tokenValidUntil,
  type SendOutcome,
  type ValidateOutcome,
} from "./messagecentral-core";

const BASE_URL = "https://cpaas.messagecentral.com";
const TIMEOUT_MS = 10_000;
export const OTP_LENGTH = 6;

let cached: { token: string; until: number } | null = null;

async function request(url: URL, method: "GET" | "POST", headers: Record<string, string>) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { method, headers, signal: controller.signal, cache: "no-store" });
    const body: unknown = await res.json().catch(() => null);
    return { status: res.status, body };
  } finally {
    clearTimeout(timer);
  }
}

/** Gets (and caches) the auth token every other call needs. Never logs the URL: the key is in it. */
async function getToken(force = false): Promise<string | null> {
  const c = messageCentralConfig();
  if (!c) return null;
  if (!force && cached && Date.now() < cached.until) return cached.token;

  const url = new URL(`${BASE_URL}/auth/v1/authentication/token`);
  url.searchParams.set("customerId", c.customerId);
  url.searchParams.set("key", Buffer.from(c.password, "utf8").toString("base64"));
  url.searchParams.set("scope", "NEW");
  url.searchParams.set("country", "91");
  if (c.email) url.searchParams.set("email", c.email);

  try {
    const { status, body } = await request(url, "GET", { accept: "*/*" });
    const token = status >= 200 && status < 300 ? parseTokenResponse(body) : null;
    if (!token) {
      console.error(`[cod] Message Central token request failed: HTTP ${status}`);
      return null;
    }
    cached = { token, until: tokenValidUntil(token) };
    return token;
  } catch (e) {
    console.error("[cod] Message Central token request error:", e instanceof Error ? e.message : "unknown");
    return null;
  }
}

/** Sends an SMS OTP to a 10-digit Indian mobile. Message Central generates the code. */
export async function sendOtp(phone: string): Promise<SendOutcome> {
  const call = async (token: string) => {
    const url = new URL(`${BASE_URL}/verification/v3/send`);
    url.searchParams.set("countryCode", "91");
    url.searchParams.set("flowType", "SMS");
    url.searchParams.set("mobileNumber", phone);
    url.searchParams.set("otpLength", String(OTP_LENGTH));
    const c = messageCentralConfig();
    if (c) url.searchParams.set("customerId", c.customerId);
    const { status, body } = await request(url, "POST", { authToken: token });
    return parseSendResponse(status, body);
  };

  try {
    let token = await getToken();
    if (!token) return { ok: false, reason: "auth", code: "no-token" };
    let out = await call(token);
    if (!out.ok && out.reason === "auth") {
      token = await getToken(true); // token may have expired: refresh once
      if (token) out = await call(token);
    }
    if (!out.ok) console.error(`[cod] Message Central send failed: ${out.reason} (code ${out.code})`);
    return out;
  } catch (e) {
    console.error("[cod] Message Central send error:", e instanceof Error ? e.message : "unknown");
    return { ok: false, reason: "error", code: "exception" };
  }
}

/** Checks a code against a verificationId from sendOtp. */
export async function validateOtp(verificationId: string, code: string): Promise<ValidateOutcome> {
  const call = async (token: string) => {
    const url = new URL(`${BASE_URL}/verification/v3/validateOtp`);
    url.searchParams.set("verificationId", verificationId);
    url.searchParams.set("code", code);
    const { status, body } = await request(url, "POST", { authToken: token });
    return parseValidateResponse(status, body);
  };

  try {
    let token = await getToken();
    if (!token) return "auth";
    let out = await call(token);
    if (out === "auth") {
      token = await getToken(true);
      if (token) out = await call(token);
    }
    if (out === "error" || out === "auth") console.error(`[cod] Message Central validate failed: ${out}`);
    return out;
  } catch (e) {
    console.error("[cod] Message Central validate error:", e instanceof Error ? e.message : "unknown");
    return "error";
  }
}
