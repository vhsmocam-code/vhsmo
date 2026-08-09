import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import { orderConfirmationEmail } from "@/lib/orders/finalizeOrder";

/**
 * Manually resend the REAL order-confirmation email for a single existing order.
 *
 * Unlike /api/test-email (which sends sample data), this loads the actual order
 * row from Supabase and rebuilds the exact same email finalizeOrder() sent, so
 * you can re-deliver it to a customer who lost / never got theirs.
 *
 * By default it sends to the email on the order. Pass `to` to override the
 * recipient (e.g. the customer gave you a corrected address).
 *
 * Guarded by RESEND_SECRET (falls back to TEST_EMAIL_SECRET). If neither is
 * configured, it only works outside production.
 *
 * GET  /api/resend-confirmation?order=order_XXXX&secret=...[&to=someone@x.com]
 * POST /api/resend-confirmation   { order, secret, to? }
 */

function authorized(secret: string | null | undefined) {
  const expected = process.env.RESEND_SECRET || process.env.TEST_EMAIL_SECRET;
  if (!expected) return process.env.NODE_ENV !== "production";
  return secret === expected;
}

async function handle(params: {
  order?: string | null;
  secret?: string | null;
  to?: string | null;
}) {
  if (!authorized(params.secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orderRef = params.order?.trim();
  if (!orderRef) {
    return NextResponse.json(
      { error: "Provide `order` (the razorpay_order_id)" },
      { status: 400 },
    );
  }

  // Look up by razorpay_order_id first, then fall back to the row id (uuid).
  let { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("razorpay_order_id", orderRef)
    .maybeSingle();

  if (!order) {
    const byId = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderRef)
      .maybeSingle();
    order = byId.data;
  }

  if (!order) {
    return NextResponse.json(
      { error: `No order found for "${orderRef}"` },
      { status: 404 },
    );
  }

  const to = (params.to?.trim() || order.email)?.trim();
  if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    return NextResponse.json(
      { error: "Order has no valid email; pass `to` to override" },
      { status: 400 },
    );
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://vhsmo.com";
  const orderUrl = `${origin}/checkout/success?order=${encodeURIComponent(
    order.razorpay_order_id,
  )}&payment=${encodeURIComponent(order.razorpay_payment_id ?? "")}`;

  try {
    const res = await sendEmail({
      to,
      subject: `Your VHSMO order ${order.razorpay_order_id} is confirmed`,
      html: orderConfirmationEmail({
        name: order.customer_name,
        orderId: order.razorpay_order_id,
        paymentId: order.razorpay_payment_id ?? "",
        total: order.total,
        orderUrl,
        shipping: {
          address1: order.address_line1,
          address2: order.address_line2,
          city: order.city,
          state: order.state,
          country: order.country,
          postalCode: order.postal_code,
        },
      }),
    });
    return NextResponse.json({
      ok: true,
      order: order.razorpay_order_id,
      to,
      messageId: res?.MessageId ?? null,
    });
  } catch (err) {
    console.error("Resend confirmation failed:", err);
    return NextResponse.json(
      { error: "Failed to send email", detail: String(err) },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  return handle({
    order: url.searchParams.get("order"),
    secret: url.searchParams.get("secret"),
    to: url.searchParams.get("to"),
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
    order: (body.order as string) ?? null,
    secret: (body.secret as string) ?? null,
    to: (body.to as string) ?? null,
  });
}
