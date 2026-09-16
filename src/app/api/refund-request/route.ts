import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  NOTES_MAX,
  REFUND_FIELDS,
  validateRefundField,
} from "@/lib/refund-validation";

/**
 * /refund-request form - the on-site replacement for the Google Form sent to
 * pre-order customers during the shipping delay. Rows land in the Supabase
 * `refund_requests` table.
 *
 * Validation runs off the same `lib/refund-validation` rules the form uses, so
 * the two can't drift and a crafted POST can't bypass the client checks. A
 * rejection names the offending `field` so the form can pin the message to it.
 *
 * The order ID customers quote is the `razorpay_order_id` printed in their
 * confirmation email, so we soft-match it against `orders`: a hit snapshots the
 * order's name/email/total/status onto the request so refunds can be processed
 * without a second lookup, a miss still saves the row (typos and the handful of
 * orders recovered manually shouldn't block anyone) with `order_matched` false.
 *
 * One request per order ID - the unique index on `order_id` turns a re-submit
 * into a friendly "already received" rather than a duplicate row.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

    const values = {
      orderId: str(body?.orderId),
      name: str(body?.name),
      email: str(body?.email),
    };

    // Same rules as the client, re-run here - the browser's checks are a
    // convenience, not a guarantee.
    for (const field of REFUND_FIELDS) {
      const message = validateRefundField(field, values);
      if (message) {
        return NextResponse.json(
          { success: false, field, message },
          { status: 400 },
        );
      }
    }

    const cleanOrderId = values.orderId;
    const cleanName = values.name;
    const cleanEmail = values.email.toLowerCase();
    const cleanNotes = str(body?.notes).slice(0, NOTES_MAX);

    // Soft lookup - never blocks the request, just enriches the row.
    const { data: order } = await supabase
      .from("orders")
      .select("id, customer_name, email, total, currency, payment_status")
      .eq("razorpay_order_id", cleanOrderId)
      .maybeSingle();

    const { error } = await supabase.from("refund_requests").insert({
      order_id: cleanOrderId,
      name: cleanName,
      email: cleanEmail,
      notes: cleanNotes || null,
      order_matched: Boolean(order),
      order_row_id: order?.id != null ? String(order.id) : null,
      order_customer_name: order?.customer_name ?? null,
      order_email: order?.email ?? null,
      order_total: order?.total ?? null,
      order_currency: order?.currency ?? null,
      order_payment_status: order?.payment_status ?? null,
    });

    if (error) {
      // 23505 - unique violation on order_id. They've already asked.
      if (error.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            field: "orderId",
            message:
              "We've already received a refund request for this Order ID.",
          },
          { status: 409 },
        );
      }
      console.error("refund request insert:", error);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("refund request:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
