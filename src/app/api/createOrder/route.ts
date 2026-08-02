import { hasLaunched } from "@/lib/launch";
import { calculateOrder } from "@/lib/orders/calculateOrder";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * The only fields the client is trusted to send. Every price-related value it
 * might also include (amount, subtotal, shippingCost, tax, total, discount) is
 * deliberately absent from this type and never read - the backend derives all
 * of it in calculateOrder().
 */
interface CreateOrderBody {
  customer?: { name?: string; email?: string; phone?: string };
  shipping?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  items?: { productId: string; quantity: number }[];
  couponCode?: string | null;
}

export async function POST(req: Request) {
  if (!hasLaunched()) {
    return NextResponse.json(
      { error: "Launch has not started" },
      { status: 403 },
    );
  }

  try {
    const body = (await req.json()) as CreateOrderBody;
    const { customer, shipping, items, couponCode } = body;

    if (!customer?.name || !customer?.email || !customer?.phone) {
      return NextResponse.json(
        { message: "Missing customer details" },
        { status: 400 },
      );
    }

    if (!shipping?.address1 || !shipping?.city || !shipping?.postalCode) {
      return NextResponse.json(
        { message: "Missing shipping details" },
        { status: 400 },
      );
    }

    // Backend is the single source of truth for every number below.
    const result = await calculateOrder({ items: items ?? [], couponCode });
    if (!result.ok) {
      return NextResponse.json(
        { message: result.message },
        { status: result.status },
      );
    }
    const { pricing } = result;

    // Razorpay charges in the smallest currency unit (paise).
    const order = await razorpay.orders.create({
      amount: Math.round(pricing.total * 100),
      currency: pricing.currency,
    });

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

      currency: pricing.currency,
      // Store the backend-priced lines, not whatever the client sent.
      items: pricing.lineItems,

      subtotal: pricing.subtotal,
      shipping_cost: pricing.shippingCost,
      tax: pricing.tax,
      discount: pricing.discount,
      coupon_code: pricing.couponCode,
      total: pricing.total,
      amount: pricing.total,

      // Coupon usage is only incremented after payment is verified, never here.
      payment_status: "pending",
    });

    if (error) {
      console.error("Supabase error creating order:", error);
      return NextResponse.json(
        { message: "Failed to create order in database" },
        { status: 500 },
      );
    }

    // Response shape is unchanged: the raw Razorpay order (id, amount,
    // currency) is exactly what the checkout widget expects.
    return NextResponse.json(order);
  } catch (error) {
    console.error("createOrder failed:", error);
    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 },
    );
  }
}
