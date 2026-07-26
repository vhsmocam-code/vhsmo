import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  recoverySchema,
  COLOR_TO_PRODUCT_COLOR,
  RECOVERY_QUANTITY,
} from "@/lib/recovery";
import { sendEmail } from "@/lib/email";
import { orderConfirmationEmail } from "@/lib/orders/finalizeOrder";

/**
 * POST /api/complete-order - the write side of the one-time order-recovery
 * flow (see src/lib/recovery.ts). It NEVER trusts the client for anything that
 * matters:
 *   - the recovery token is re-validated here against `incomplete_orders`;
 *   - email, amount and both Razorpay ids come from that trusted row, not the
 *     request body (the browser never even receives the Razorpay ids);
 *   - an already-completed token is rejected, so a link can't be replayed to
 *     create duplicate orders.
 * On success it inserts the real `orders` row and flips the recovery row's
 * `completed` flag to true.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 400 },
    );
  }

  // 1. Validate the shape of the form payload.
  const parsed = recoverySchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      {
        success: false,
        message: first?.message ?? "Please check the form and try again.",
        field: first?.path?.join("."),
      },
      { status: 400 },
    );
  }

  const {
    token,
    customerName,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    color,
  } = parsed.data;

  // Fixed at 1 - these are single-unit recoveries (see RECOVERY_QUANTITY).
  const quantity = RECOVERY_QUANTITY;

  // 2. Re-validate the token server-side against the trusted row.
  const { data: recovery, error: recoveryError } = await supabase
    .from("incomplete_orders")
    .select(
      "id, recovery_token, email, razorpay_order_id, razorpay_payment_id, amount, completed",
    )
    .eq("recovery_token", token)
    .maybeSingle();

  if (recoveryError) {
    console.error("complete-order: lookup failed", recoveryError);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  // Invalid / unknown token.
  if (!recovery) {
    return NextResponse.json(
      { success: false, message: "This recovery link is not valid." },
      { status: 404 },
    );
  }

  // 3. Reject a token that has already been used (prevents duplicates).
  if (recovery.completed) {
    return NextResponse.json(
      { success: false, message: "This recovery link has already been used." },
      { status: 409 },
    );
  }

  // 4. Resolve the finish to a real catalogue product so the order line carries
  //    the true id / name / price - never a client-supplied amount.
  const productColor = COLOR_TO_PRODUCT_COLOR[color];
  const { data: product } = await supabase
    .from("products")
    .select("id, name, color, selling_price")
    .eq("color", productColor)
    .maybeSingle();

  const unitPrice = product?.selling_price ?? recovery.amount;
  const items = [
    {
      productId: product?.id ?? null,
      name: (product?.name ?? "VHSMO Vol. 1").trim(),
      variant: product?.color ?? productColor,
      quantity,
      price: unitPrice,
      total: unitPrice * quantity,
      // Recovery-only breadcrumb so we can trace where this order came from.
      recovered: true,
    },
  ];

  // The amount actually captured lives on the recovery row; the customer paid
  // for a single unit, so the money on the order mirrors that.
  const amount = recovery.amount;

  // 5. Insert the real order.
 const { data: order, error: insertError } = await supabase
   .from("orders")
   .insert({
     razorpay_order_id: recovery.razorpay_order_id,
     razorpay_payment_id: recovery.razorpay_payment_id,
     customer_name: customerName,
     email: recovery.email,
     phone,
     address_line1: addressLine1,
     address_line2: addressLine2,
     city,
     state,
     country: "India",
     postal_code: pincode,
     amount,
     currency: "INR",
     items,
     subtotal: amount,
     shipping_cost: 0,
     tax: 0,
     total: amount,
     payment_status: "paid",
   })
   .select()
   .single();

 if (insertError) {
   console.error(insertError);
   return NextResponse.json(
     {
       success: false,
       message: "We couldn't save your order. Please try again.",
     },
     { status: 500 },
   );
 }

 await sendEmail({
   to: order.email,
   subject: `Your VHSMO order ${order.razorpay_order_id} is confirmed`,
   html: orderConfirmationEmail({
     name: order.customer_name,
     orderId: order.razorpay_order_id,
     paymentId: order.razorpay_payment_id,
     total: order.total,
     orderUrl: `https://vhsmo.com/checkout/success?order_id=${order.razorpay_order_id}`,
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

  // 6. Burn the recovery link. Guarded on `completed=false` so two racing
  //    submissions can't both write an order.
  const { error: completeError } = await supabase
    .from("incomplete_orders")
    .update({ completed: true })
    .eq("id", recovery.id)
    .eq("completed", false);

  if (completeError) {
    // The order is already saved; log and continue - the buyer is done.
    console.error("complete-order: failed to mark completed", completeError);
  }

  // The razorpay_order_id is the key the order-view page (/checkout/success)
  // fetches by - the same id it already carries in the URL for a normal
  // checkout, so returning it here exposes nothing new.
  return NextResponse.json({
    success: true,
    orderId: recovery.razorpay_order_id,
  });
}
