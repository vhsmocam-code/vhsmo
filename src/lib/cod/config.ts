/**
 * COD switches. `NEXT_PUBLIC_COD_ENABLED` is the single kill switch: the
 * checkout reads it to show the option and the server reads it to accept COD
 * orders. It is inlined at build time, so changing it needs a redeploy.
 */

const flag = (v: string | undefined) => /^(1|true|yes|on)$/i.test((v ?? "").trim());

/** How COD buyers are verified: an emailed code (default) or an SMS code. */
export function otpChannel(): "email" | "sms" {
  return process.env.NEXT_PUBLIC_COD_OTP_CHANNEL?.trim().toLowerCase() === "sms" ? "sms" : "email";
}

export const codEnabled = () => flag(process.env.NEXT_PUBLIC_COD_ENABLED);

const isProd = () => process.env.NODE_ENV === "production";

/** Secret for OTP hashes and verification tokens. Required in production. */
export function codSecret(): string | null {
  const s = process.env.COD_OTP_SECRET?.trim();
  if (s && s.length >= 16) return s;
  return isProd() ? null : "dev-only-cod-otp-secret-not-for-prod";
}

/** Message Central VerifyNow credentials, or null when not configured. */
export function messageCentralConfig(): { customerId: string; password: string; email: string } | null {
  const customerId = process.env.MESSAGECENTRAL_CUSTOMER_ID?.trim() || "";
  const password = process.env.MESSAGECENTRAL_PASSWORD?.trim() || "";
  if (!customerId || !password) return null;
  return { customerId, password, email: process.env.MESSAGECENTRAL_EMAIL?.trim() || "" };
}

/** Without Message Central keys, non-production logs a local OTP to the server console. */
export const devOtpFallback = () => !messageCentralConfig() && !isProd();
