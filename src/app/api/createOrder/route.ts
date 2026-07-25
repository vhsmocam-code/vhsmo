import { hasLaunched } from "@/lib/launch";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {


    if (!hasLaunched()) {
      return Response.json(
        { error: "Launch has not started" },
        { status: 403 },
      );
    } 
    
  try {
const {
  amount,
  customer,
  shipping,
  items,
  subtotal,
  shippingCost,
  tax,
  total,
} = await req.json();

console.log("Received order data:", {
  amount,
  customer,
  shipping,
  items,
  subtotal,
  shippingCost,
  tax,
  total,
});

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
    });
    console.log(order,"order...")
    const { error } = await supabase.from("orders").insert({
      razorpay_order_id: order.id,

      customer_name: customer.name,
      email: customer.email,
      phone: customer.phone,

      address_line1: shipping.address1,
      address_line2: shipping.address2,
      city: shipping.city,
      state: shipping.state,
      country: shipping.country,
      postal_code: shipping.postalCode,
      amount: total,
      currency: "INR",
      items,

      subtotal,
      shipping_cost: shippingCost,
      tax,
      total,

      payment_status: "pending",
    });
    console.log(error,"error...")
    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { message: "Failed to create order in database", error },
        { status: 500 },
      );
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error("Full Razorpay error:", error);

    return NextResponse.json(
      {
        message: "Failed to create order",
        error,
      },
      { status: 500 },
    );
  }
}
