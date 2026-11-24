import { NextResponse } from "next/server";
import { hasLaunched } from "@/lib/launch";
import { codEnabled, otpChannel } from "@/lib/cod/config";
import { parseContact } from "@/lib/cod/core";
import { clientIp, issueOtp } from "@/lib/cod/otp";

export async function POST(req: Request) {
  if (!hasLaunched() || !codEnabled()) {
    return NextResponse.json({ ok: false, message: "Cash on Delivery is not available" }, { status: 403 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const channel = otpChannel();
    const parsed = parseContact(channel, { email: body?.email, phone: body?.phone });
    if (!parsed.ok) {
      return NextResponse.json({ ok: false, message: parsed.message }, { status: 400 });
    }
    const result = await issueOtp({ channel, contact: parsed.contact, ip: clientIp(req) });
    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.message, resendIn: result.resendIn }, { status: result.status });
    }
    return NextResponse.json({ ok: true, resendIn: result.resendIn });
  } catch (e) {
    console.error("[cod] OTP send failed:", e);
    return NextResponse.json({ ok: false, message: "Could not send the code. Please try again." }, { status: 500 });
  }
}
