import { NextResponse } from "next/server";
import crypto from "crypto";
import { finalizeOrder, OrderNotFoundError } from "@/lib/orders/finalizeOrder";

export async function POST(req: Request) {
  try {
    // Razorpay sends the raw body

    // Signature header
    const signature = req.headers.get("x-razorpay-signature");
   
    const body = await req.text();
    console.log("Body length:", body.length);

    console.log(
      "Webhook secret exists:",
      !!process.env.RAZORPAY_WEBHOOK_SECRET,
    );
    if (!signature) {
      return NextResponse.json(
        { success: false, message: "Missing signature" },
        { status: 400 },
      );
    }

    // Verify webhook signature
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured");
    }

//    const expectedSignature = crypto
//      .createHmac("sha256", secret)
//      .update(body)
//      .digest("hex");

//    const valid =
//      expectedSignature.length === signature.length &&
//      crypto.timingSafeEqual(
//        Buffer.from(expectedSignature),
//        Buffer.from(signature),
//      );

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  console.log("Expected:", expectedSignature);
  console.log("Received:", signature);

  const valid =
    expectedSignature.length === signature.length &&
    crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature),
    );

  console.log("Signature valid:", valid);

  if (!valid) {
    return NextResponse.json(
      { success: false, message: "Invalid signature" },
      { status: 400 },
    );
  }

    // Parse the webhook payload
    const event = JSON.parse(body);

    // We only care about successful payments
    if (event.event !== "payment.captured") {
      return NextResponse.json({ success: true });
    }

    const payment = event?.payload?.payment?.entity;

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Invalid webhook payload" },
        { status: 400 },
      );
    }
    const razorpayOrderId = payment.order_id;
    const razorpayPaymentId = payment.id;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json(
        { success: false, message: "Missing payment identifiers" },
        { status: 400 },
      );
    }

    // finalizeOrder loads the order, enforces idempotency, and reads all order
    // data from Supabase itself - a missing order or an already-paid one is
    // handled inside and simply results in a no-op here.
    try {
      await finalizeOrder({ razorpayOrderId, razorpayPaymentId, req });
    } catch (err) {
      if (err instanceof OrderNotFoundError) {
        // Webhooks retry on non-2xx; there's nothing to finalize, so ack it.
        console.warn("Order not found for webhook:", razorpayOrderId);
        return NextResponse.json({ success: true });
      }
      throw err;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);

    return NextResponse.json({ success: false }, { status: 500 });
  }
}
