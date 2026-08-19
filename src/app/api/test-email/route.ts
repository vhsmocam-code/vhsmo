import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { orderConfirmationEmail } from "@/lib/orders/finalizeOrder";

/**
 * Manual test route for the order-confirmation email. Not part of the checkout
 * flow — it just renders orderConfirmationEmail() with sample (or overridden)
 * values and sends it to whatever address you pass, so you can eyeball the
 * template in a real inbox.
 *
 * Guarded by TEST_EMAIL_SECRET so it can't be triggered by anyone who finds it.
 *
 * GET  /api/test-email?to=you@example.com&secret=... [&name=&total=]
 * POST /api/test-email   { to, secret, name?, total?, orderId?, paymentId?, shipping? }
 */

function authorized(secret: string | null | undefined) {
  const expected = process.env.TEST_EMAIL_SECRET;
  // If no secret is configured, only allow outside production.
  if (!expected) return process.env.NODE_ENV !== "production";
  return secret === expected;
}

async function handle(params: {
  to?: string | null;
  secret?: string | null;
  name?: string | null;
  total?: number | string | null;
  orderId?: string | null;
  paymentId?: string | null;
  shipping?: Record<string, string | undefined>;
}) {
  if (!authorized(params.secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const to = params.to?.trim();
  if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    return NextResponse.json(
      { error: "Provide a valid `to` email address" },
      { status: 400 },
    );
  }

  const orderId = params.orderId || "order_TESTORDER123456";
  const paymentId = params.paymentId || "pay_TESTPAYMENT7890";
  const total = Number(params.total ?? 4999);
  const name = params.name || "Test Customer";

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://vhsmo.com";
  const orderUrl = `${origin}/checkout/success?order=${encodeURIComponent(
    orderId,
  )}&payment=${encodeURIComponent(paymentId)}`;

  const shipping = params.shipping ?? {
    address1: "221B Baker Street",
    address2: "Flat 2",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    postalCode: "400001",
  };

  try {
    const res = await sendEmail({
      to,
      subject: `Your VHSMO order ${orderId} is confirmed`,
      html: orderConfirmationEmail({
        name,
        orderId,
        paymentId,
        total,
        orderUrl,
        shipping,
      }),
    });
    return NextResponse.json({
      ok: true,
      to,
      messageId: res?.MessageId ?? null,
    });
  } catch (err) {
    console.error("Test email failed:", err);
    return NextResponse.json(
      { error: "Failed to send email", detail: String(err) },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  return handle({
    to: url.searchParams.get("to"),
    secret: url.searchParams.get("secret"),
    name: url.searchParams.get("name"),
    total: url.searchParams.get("total"),
    orderId: url.searchParams.get("orderId"),
    paymentId: url.searchParams.get("paymentId"),
  });
}

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // allow empty body
  }
  return handle({
    to: (body.to as string) ?? null,
    secret: (body.secret as string) ?? null,
    name: (body.name as string) ?? null,
    total: (body.total as string | number) ?? null,
    orderId: (body.orderId as string) ?? null,
    paymentId: (body.paymentId as string) ?? null,
    shipping: body.shipping as Record<string, string | undefined> | undefined,
  });
}
