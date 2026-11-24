import { NextResponse } from "next/server";
import { hasLaunched } from "@/lib/launch";
import { codEnabled, otpChannel } from "@/lib/cod/config";
import { parseContact } from "@/lib/cod/core";
import { verifyOtp } from "@/lib/cod/otp";

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
    const code = String(body?.code ?? "").replace(/\D/g, "");
    const result = await verifyOtp({ channel, contact: parsed.contact, code });
    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.message }, { status: result.status });
    }
    return NextResponse.json({ ok: true, token: result.token });
  } catch (e) {
    console.error("[cod] OTP verify failed:", e);
    return NextResponse.json({ ok: false, message: "Could not verify the code. Please try again." }, { status: 500 });
  }
}
