import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import { finalizeOrder } from "@/lib/orders/finalizeOrder";

export async function POST(req: Request) {
  try {
    // Razorpay sends the raw body
    const body = await req.text();

    // Signature header
    const signature = req.headers.get("x-razorpay-signature");

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

   const expectedSignature = crypto
     .createHmac("sha256", secret)
     .update(body)
     .digest("hex");

   const valid =
     expectedSignature.length === signature.length &&
     crypto.timingSafeEqual(
       Buffer.from(expectedSignature),
       Buffer.from(signature),
     );

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

    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("razorpay_order_id", razorpayOrderId)
      .maybeSingle();

    if (error) throw error;

  if (!order) {
    console.warn("Order not found:", razorpayOrderId);
    return NextResponse.json({ success: true });
  }
    if (order.payment_status === "paid") {
      return NextResponse.json({ success: true });
    }
await finalizeOrder({
  razorpayOrderId,
  razorpayPaymentId,
  customer: {
    name: order.customer_name,
    email: order.email,
  },
  shipping: {
    address1: order.address_line1,
    address2: order.address_line2,
    city: order.city,
    state: order.state,
    country: order.country,
    postalCode: order.postal_code,
  },
  items: order.items,
  total: order.total,
  req,
});

 


    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);

    return NextResponse.json({ success: false }, { status: 500 });
  }
}
