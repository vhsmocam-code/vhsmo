import { supabase } from "@/lib/supabase";
import { codSecret, devOtpFallback, messageCentralConfig } from "./config";
import {
  OTP_MAX_ATTEMPTS,
  OTP_MAX_PER_IP_HOUR,
  OTP_MAX_PER_PHONE_HOUR,
  OTP_RESEND_SECONDS,
  OTP_TTL_MINUTES,
  generateOtp,
  hashOtp,
  safeEqualHex,
  signOtpToken,
  type OtpChannel,
} from "./core";
import { sendOtpEmail } from "./email";
import { sendOtp, validateOtp } from "./messagecentral";

const TABLE = "cod_otps";
/** The `cod_otps` column that holds this channel's contact. */
const column = (channel: OtpChannel) => (channel === "email" ? "email" : "phone");

export type OtpResult =
  | { ok: true; resendIn: number }
  | { ok: false; status: number; message: string; resendIn?: number };

/** Best-effort client IP (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

/**
 * Sends a fresh code to `contact` (an email, or a phone on the SMS channel),
 * enforcing the resend gap and hourly limits per contact and per IP.
 */
export async function issueOtp(args: {
  channel: OtpChannel;
  contact: string;
  ip: string;
}): Promise<OtpResult> {
  const { channel, contact, ip } = args;
  const col = column(channel);
  const secret = codSecret();
  if (!secret) return { ok: false, status: 503, message: "Cash on Delivery is unavailable right now" };

  const now = Date.now();
  const hourAgo = new Date(now - 3_600_000).toISOString();

  const { data: recent, error } = await supabase
    .from(TABLE)
    .select("created_at")
    .eq(col, contact)
    .gte("created_at", hourAgo)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const last = recent?.[0] ? new Date(recent[0].created_at).getTime() : 0;
  const wait = Math.ceil((last + OTP_RESEND_SECONDS * 1000 - now) / 1000);
  if (wait > 0) {
    return { ok: false, status: 429, message: `Please wait ${wait}s before requesting another code`, resendIn: wait };
  }
  if ((recent?.length ?? 0) >= OTP_MAX_PER_PHONE_HOUR) {
    return { ok: false, status: 429, message: "Too many codes requested. Try again in an hour." };
  }

  if (ip !== "unknown") {
    const { count: ipCount, error: ipError } = await supabase
      .from(TABLE)
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", hourAgo);
    if (ipError) throw ipError;
    if ((ipCount ?? 0) >= OTP_MAX_PER_IP_HOUR) {
      return { ok: false, status: 429, message: "Too many codes requested. Try again later." };
    }
  }

  const expiresAt = new Date(now + OTP_TTL_MINUTES * 60_000).toISOString();

  if (channel === "email") {
    // We generate the code, store only its hash, and email it from no-reply@.
    const code = generateOtp();
    const { data: row, error: insertError } = await supabase
      .from(TABLE)
      .insert({ channel, email: contact, ip, code_hash: hashOtp(secret, contact, code), expires_at: expiresAt })
      .select("id")
      .single();
    if (insertError) throw insertError;

    if (!(await sendOtpEmail(contact, code))) {
      // Never leave a usable code behind for an email that didn't go out.
      await supabase.from(TABLE).update({ expires_at: new Date(now).toISOString() }).eq("id", row.id);
      return { ok: false, status: 502, message: "We couldn't send the code. Please try again." };
    }
    return { ok: true, resendIn: OTP_RESEND_SECONDS };
  }

  // ── SMS channel (Message Central) ──
  if (messageCentralConfig()) {
    const sent = await sendOtp(contact);
    if (!sent.ok) {
      if (sent.reason === "invalid-number") {
        return { ok: false, status: 400, message: "Enter a valid 10-digit Indian mobile number" };
      }
      if (sent.reason === "rate-limited") {
        return { ok: false, status: 429, message: "A code was just sent. Please wait a minute before requesting another.", resendIn: OTP_RESEND_SECONDS };
      }
      return { ok: false, status: 502, message: "We couldn't send the code. Please try again." };
    }
    const { error: insertError } = await supabase
      .from(TABLE)
      .insert({ channel, phone: contact, ip, verification_id: sent.verificationId, expires_at: expiresAt });
    if (insertError) throw insertError;
    return { ok: true, resendIn: OTP_RESEND_SECONDS };
  }

  if (devOtpFallback()) {
    // Local development only: no SMS provider, so print the code.
    const code = generateOtp();
    const { error: insertError } = await supabase
      .from(TABLE)
      .insert({ channel, phone: contact, ip, code_hash: hashOtp(secret, contact, code), expires_at: expiresAt });
    if (insertError) throw insertError;
    console.log(`[cod][dev] OTP for ${contact}: ${code} (Message Central not configured, SMS not sent)`);
    return { ok: true, resendIn: OTP_RESEND_SECONDS };
  }

  console.error("[cod] MESSAGECENTRAL_CUSTOMER_ID / MESSAGECENTRAL_PASSWORD missing - cannot send OTP");
  return { ok: false, status: 503, message: "Cash on Delivery is unavailable right now" };
}

export type VerifyResult =
  | { ok: true; token: string }
  | { ok: false; status: number; message: string };

/** Checks a code against the newest live OTP for the contact; returns a one-use token. */
export async function verifyOtp(args: {
  channel: OtpChannel;
  contact: string;
  code: string;
}): Promise<VerifyResult> {
  const { channel, contact, code } = args;
  const secret = codSecret();
  if (!secret) return { ok: false, status: 503, message: "Cash on Delivery is unavailable right now" };
  if (!/^\d{4,8}$/.test(code)) return { ok: false, status: 400, message: "Enter the code we sent you" };

  const { data: row, error } = await supabase
    .from(TABLE)
    .select("id, code_hash, verification_id, attempts, expires_at, verified_at")
    .eq(column(channel), contact)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;

  if (!row || new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false, status: 400, message: "This code has expired. Request a new one." };
  }
  if (row.verified_at) {
    // Already verified (e.g. double submit) - hand out a token again.
    return { ok: true, token: signOtpToken(secret, row.id, contact) };
  }
  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    return { ok: false, status: 429, message: "Too many wrong attempts. Request a new code." };
  }

  let correct: boolean;
  if (row.verification_id) {
    // SMS via Message Central: the provider checks the code.
    const outcome = await validateOtp(row.verification_id, code);
    if (outcome === "expired" || outcome === "unknown-request") {
      return { ok: false, status: 400, message: "This code has expired. Request a new one." };
    }
    if (outcome === "limit") {
      return { ok: false, status: 429, message: "Too many wrong attempts. Request a new code." };
    }
    if (outcome === "already-verified") {
      // Not proof that THIS code was right - never hand out a token for it.
      return { ok: false, status: 400, message: "This code was already used. Request a new one." };
    }
    if (outcome === "auth" || outcome === "error") {
      return { ok: false, status: 502, message: "We couldn't verify the code right now. Please try again." };
    }
    correct = outcome === "verified";
  } else {
    correct = Boolean(row.code_hash) && safeEqualHex(row.code_hash as string, hashOtp(secret, contact, code));
  }

  if (!correct) {
    // Compare-and-swap on attempts so parallel guesses can't skip our own limit.
    const { data: bumped } = await supabase
      .from(TABLE)
      .update({ attempts: row.attempts + 1 })
      .eq("id", row.id)
      .eq("attempts", row.attempts)
      .select("attempts");
    const used = bumped?.[0]?.attempts ?? OTP_MAX_ATTEMPTS;
    const left = Math.max(0, OTP_MAX_ATTEMPTS - used);
    return {
      ok: false,
      status: 400,
      message: left > 0 ? `Incorrect code. ${left} ${left === 1 ? "try" : "tries"} left.` : "Too many wrong attempts. Request a new code.",
    };
  }

  const { error: updError } = await supabase
    .from(TABLE)
    .update({ verified_at: new Date().toISOString() })
    .eq("id", row.id);
  if (updError) throw updError;
  return { ok: true, token: signOtpToken(secret, row.id, contact) };
}

/** Marks a verified OTP as used by an order. False if it was already used. */
export async function consumeOtp(otpId: string, channel: OtpChannel, contact: string): Promise<boolean> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", otpId)
    .eq(column(channel), contact)
    .not("verified_at", "is", null)
    .is("consumed_at", null)
    .select("id");
  if (error) throw error;
  return (data?.length ?? 0) === 1;
}

/** Puts a consumed OTP back if the order it was spent on failed to save. */
export async function releaseOtp(otpId: string): Promise<void> {
  await supabase.from(TABLE).update({ consumed_at: null }).eq("id", otpId);
}

/** COD orders already placed from this IP in the last 24h (spent OTPs). */
export async function codOrdersFromIp(ip: string): Promise<number> {
  if (ip === "unknown") return 0;
  const since = new Date(Date.now() - 24 * 3_600_000).toISOString();
  const { count, error } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .not("consumed_at", "is", null)
    .gte("consumed_at", since);
  if (error) throw error;
  return count ?? 0;
}
