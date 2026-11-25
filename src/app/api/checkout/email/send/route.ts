import { NextResponse } from "next/server";
import { parseContact } from "@/lib/cod/core";
import { clientIp, issueOtp } from "@/lib/cod/otp";

/**
 * Emails a 6-digit code to prove the shopper owns the checkout email. Used for
 * both online and Cash on Delivery orders. Limits (resend gap, per-email and
 * per-IP hourly caps) live in issueOtp.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = parseContact("email", { email: body?.email });
    if (!parsed.ok) {
      return NextResponse.json({ ok: false, message: parsed.message }, { status: 400 });
    }
    const result = await issueOtp({ channel: "email", contact: parsed.contact, ip: clientIp(req) });
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: result.message, resendIn: result.resendIn },
        { status: result.status },
      );
    }
    return NextResponse.json({ ok: true, resendIn: result.resendIn });
  } catch (e) {
    console.error("[checkout] email code send failed:", e);
    return NextResponse.json(
      { ok: false, message: "Could not send the code. Please try again." },
      { status: 500 },
    );
  }
}
