import { emailAssetBase, sendEmail } from "@/lib/email";
import { OTP_TTL_MINUTES } from "./core";
import { OTP_FROM, renderOtpEmail } from "@/lib/email/templates";

/** Sends the code. Returns false (never throws) so the caller can show a friendly error. */
export async function sendOtpEmail(to: string, code: string): Promise<boolean> {
  try {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[checkout][dev] email OTP for ${to}: ${code}`);
      // `.test` is a reserved TLD that can never receive mail, so developers
      // can walk the flow end to end without sending anything.
      if (/@[^@]+\.test$/i.test(to)) return true;
    }
    const { html, text } = renderOtpEmail(code, OTP_TTL_MINUTES, emailAssetBase());
    await sendEmail({
      to,
      from: OTP_FROM,
      subject: `${code} is your VHSMO verification code`,
      html,
      text,
    });
    return true;
  } catch (e) {
    console.error("[checkout] OTP email failed:", e instanceof Error ? e.message : "unknown");
    return false;
  }
}
