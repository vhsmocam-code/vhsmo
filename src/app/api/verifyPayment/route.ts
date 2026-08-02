import { NextResponse } from "next/server";
import crypto from "crypto";

import { finalizeOrder, OrderNotFoundError } from "@/lib/orders/finalizeOrder";

export async function POST(req: Request) {
  try {
    // The payment response is the ONLY thing we trust from the client. Any
    // customer/shipping/items/total it may also send is ignored - finalizeOrder
    // reads all of that from the pending order in Supabase.
    const { payment } = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      payment ?? {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Missing payment details" },
        { status: 400 },
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 },
      );
    }

    await finalizeOrder({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      req,
    });

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    if (error instanceof OrderNotFoundError) {
      console.error(error.message);
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    console.error("verifyPayment failed:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
