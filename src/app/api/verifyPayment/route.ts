import { NextResponse } from "next/server";
import crypto from "crypto";

import { finalizeOrder } from "@/lib/orders/finalizeOrder";
export async function POST(req: Request) {
  try {
    const {
      payment,
      customer,
      shipping,
      items,
      total,
    } = await req.json();
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
        {
          success: false,
          message: "Invalid signature",
        },
        { status: 400 },
      );
    }

    await finalizeOrder({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      customer,
      shipping,
      items,
      total,
      req,
    });

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
    });

   
    
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      { status: 500 },
    );
  }
}
