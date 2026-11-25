import { NextResponse } from "next/server";
import { parseContact } from "@/lib/cod/core";
import { verifyOtp } from "@/lib/cod/otp";

/** Checks the emailed code and returns the signed token createOrder requires. */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = parseContact("email", { email: body?.email });
    if (!parsed.ok) {
      return NextResponse.json({ ok: false, message: parsed.message }, { status: 400 });
    }
    const code = String(body?.code ?? "").replace(/\D/g, "");
    const result = await verifyOtp({ channel: "email", contact: parsed.contact, code });
    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.message }, { status: result.status });
    }
    return NextResponse.json({ ok: true, token: result.token });
  } catch (e) {
    console.error("[checkout] email code verify failed:", e);
    return NextResponse.json(
      { ok: false, message: "Could not verify the code. Please try again." },
      { status: 500 },
    );
  }
}
