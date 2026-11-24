import { revalidateTag } from "next/cache";
import { after } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import { redeemCoupon } from "@/lib/coupons/redeemCoupon";
import { DELIVERY_NOTE, DISPATCH_ETA } from "@/lib/shipping";
import { enqueueEasyEcomOrder, processOrder } from "@/lib/easyecom";
import { ORDERS_TABLE } from "@/lib/orders/table";
import { displayOrderId } from "@/lib/order-id";
import {
  NO_REPLY_FROM,
  renderOrderConfirmation,
  type ConfirmationArgs,
} from "@/lib/email/templates";

/** Thrown when no order exists for a verified payment - lets the route map it
 *  to a 404 rather than a generic 500. */
export class OrderNotFoundError extends Error {
  constructor(razorpayOrderId: string) {
    super(`Order not found: ${razorpayOrderId}`);
    this.name = "OrderNotFoundError";
  }
}

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function decrementStock(productId: string, quantity: number) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: current, error } = await supabase
      .from("products")
      .select("stock")
      .eq("id", productId)
      .single();
    if (error || current?.stock == null) return false;

    const next = Math.max(0, current.stock - quantity);
    const { data: updated } = await supabase
      .from("products")
      .update({ stock: next })
      .eq("id", productId)
      .eq("stock", current.stock)
      .select("id");
    if (updated?.length) return true;
  }
  return false;
}

type ConfirmationInput = Omit<ConfirmationArgs, "dispatchEta" | "deliveryNote">;

/**
 * The confirmation email: HTML, plain text and the sender (no-reply@). Spread it
 * into sendEmail so every confirmation goes out from the same address. The ID is
 * shown without `order_`.
 */
export function orderConfirmationMessage(input: ConfirmationInput) {
  return {
    ...renderOrderConfirmation({
      ...input,
      orderId: displayOrderId(input.orderId),
      dispatchEta: DISPATCH_ETA,
      deliveryNote: DELIVERY_NOTE,
    }),
    from: NO_REPLY_FROM,
  };
}

/** HTML only - kept so existing callers keep working. */
export function orderConfirmationEmail(input: ConfirmationInput): string {
  return orderConfirmationMessage(input).html;
}

interface StoredOrderItem {
  productId?: string;
  quantity?: number;
}

/**
 * Finalizes a paid order. The Razorpay ids are the only inputs; every piece of
 * order data (customer, shipping, items, pricing, coupon) is read back from the
 * pending order row in Supabase, which is the single source of truth. Nothing
 * the browser sent after payment is trusted here.
 *
 * Side effects (coupon redemption, stock, email) run exactly once, gated on the
 * pending -> paid transition, so retries and webhook duplicates are safe.
 */
export async function finalizeOrder({
  razorpayOrderId,
  razorpayPaymentId,
  req,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  req: Request;
}) {
 
  // 1. Load the pending order - the single source of truth.
  const { data: order, error } = await supabase
    .from(ORDERS_TABLE)
    .select("*")
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();

  if (error) throw error;
  if (!order) throw new OrderNotFoundError(razorpayOrderId);


  // 2. Idempotency - already processed by an earlier call or the webhook.
  if (order.payment_status === "paid") return;

  // 3. Claim the order: flip pending -> paid atomically. Only the caller that
  //    wins this compare-and-swap runs the side effects below, so concurrent
  //    verify + webhook calls can't double-process.
  const { data: claimed, error: claimError } = await supabase
    .from(ORDERS_TABLE)
    .update({
      payment_status: "paid",
      razorpay_payment_id: razorpayPaymentId,
      paid_at: new Date().toISOString(),
      amount: order.total,
      currency: order.currency ?? "INR",
    })
    .eq("razorpay_order_id", razorpayOrderId)
    .eq("payment_status", "pending")
    .select("id");

  if (claimError) throw claimError;
  if (!claimed?.length) {
    // Another call finalized between our read and write - nothing left to do.
    return;
  }

  await runConfirmedOrderSideEffects(order, { paymentId: razorpayPaymentId, req });
}

/**
 * Confirms a Cash on Delivery order right after it is created. Same side
 * effects as a paid order (EasyEcom, stock, email), gated on its own
 * pending -> cod_confirmed transition so it runs exactly once. Never throws:
 * the order row already exists, so the shopper must still see success.
 */
export async function confirmCodOrder({ orderId, req }: { orderId: string; req: Request }) {
  try {
    const { data: claimed, error } = await supabase
      .from(ORDERS_TABLE)
      .update({ payment_status: "cod_confirmed" })
      .eq("razorpay_order_id", orderId)
      .eq("payment_method", "cod")
      .eq("payment_status", "pending")
      .select("*");
    if (error) throw error;
    const order = claimed?.[0];
    if (!order) return;
    await runConfirmedOrderSideEffects(order, { paymentId: null, req });
  } catch (e) {
    console.error(`COD confirmation failed for ${orderId}:`, e);
  }
}

/**
 * Everything that happens once an order is confirmed (paid online, or COD
 * placed). Runs once per order - callers gate it on their own CAS.
 */
async function runConfirmedOrderSideEffects(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: any,
  { paymentId, req }: { paymentId: string | null; req: Request },
) {
  const razorpayOrderId: string = order.razorpay_order_id;
  const isCod = order.payment_method === "cod";

  // 3b. Queue the order for EasyEcom. This runs first, right after the claim,
  //     so a later failure (stock, email, coupon) can't stop a paid order from
  //     being queued. It never throws and is a no-op unless EASYECOM_ENABLED.
  //     The send itself happens after the response, and a cron sweep retries.
  try {
    const queued = await enqueueEasyEcomOrder(order);
    if (queued === "queued") {
      after(() => processOrder(razorpayOrderId));
    }
  } catch (easyEcomError) {
    console.error(`EasyEcom enqueue failed for ${razorpayOrderId}:`, easyEcomError);
  }

  // 4. Reduce stock for each purchased line (from the stored, backend-priced
  //    items - not from anything the client just sent).
  const items: StoredOrderItem[] = Array.isArray(order.items)
    ? order.items
    : [];
  for (const item of items) {
    const productId = item?.productId;
    if (typeof productId === "string" && UUID.test(productId)) {
      await decrementStock(productId, Math.max(1, Math.floor(item.quantity ?? 1)));
    }
  }

  // 5. Refresh cached product data (stock changed).
  revalidateTag("products");

  // 6. Confirmation email - built entirely from stored values. Best-effort: the
  //    order is already paid, so a mail failure must not surface as an error
  //    (which would strand the paid order and never retry the email anyway).
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    new URL(req.url).origin;

  const orderUrl = isCod
    ? `${origin}/checkout/success?order=${encodeURIComponent(razorpayOrderId)}&method=cod`
    : `${origin}/checkout/success?order=${encodeURIComponent(
        razorpayOrderId,
      )}&payment=${encodeURIComponent(paymentId ?? "")}`;

  try {
    await sendEmail({
      to: order.email,
      subject: isCod
        ? `Your VHSMO order ${displayOrderId(razorpayOrderId)} is placed (Cash on Delivery)`
        : `Your VHSMO order ${displayOrderId(razorpayOrderId)} is confirmed`,
      ...orderConfirmationMessage({
        name: order.customer_name,
        orderId: razorpayOrderId,
        paymentId: paymentId ?? "",
        paymentMethod: isCod ? "cod" : "prepaid",
        codFee: Number(order.cod_fee) || 0,
        items: Array.isArray(order.items) ? order.items : [],
        subtotal: order.subtotal,
        discount: order.discount,
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
  } catch (mailError) {
    console.error(
      `Confirmation email failed for order ${razorpayOrderId}:`,
      mailError,
    );
  }

  // 7. Bump the coupon's used_count (never in createOrder). This runs last -
  //    payment already succeeded and the confirmation email is out - so a
  //    limit-reached / lookup problem is logged but must not fail the order.
  if (order.coupon_code) {
    const result = await redeemCoupon(order.coupon_code);
    if (!result.redeemed) {
      console.error(
        `Coupon ${order.coupon_code} used_count not incremented for order ${razorpayOrderId}: ${result.reason}`,
      );
    }
  }
}