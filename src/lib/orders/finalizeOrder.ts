import { revalidateTag } from "next/cache";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import { redeemCoupon } from "@/lib/coupons/redeemCoupon";

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

const money = (n: number) =>
  `₹${Number(n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

// The VHSMO wordmark (Kodak-yellow on transparent) sits on the brand darkroom
// band in both the header and the footer so it stays legible; the message copy
// between the two bands is dynamic HTML.
const LOGO_IMG =
  "https://res.cloudinary.com/jyejt2p3/image/upload/v1784963870/Frame_58_jtqo1t.png";
const INK = "#2a2422"; // brand darkroom
const ACCENT = "#1093ff"; // brand blue (bluehour) — the CTA
const MUTE = "#6e6862"; // brand muted
const LINE = "#e3e3e1"; // brand halide — divider hairlines

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

export function orderConfirmationEmail({
  name,
  orderId,
  paymentId,
  total,
  orderUrl,
  shipping,
}: {
  name: string;
  orderId: string;
  paymentId: string;
  total: number;
  orderUrl: string;
  shipping?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}) {
  const summaryRow = (label: string, value: string, strong = false) => `
    <div style="font-size:14px;line-height:1.9;color:${INK};">
      <span style="color:${MUTE};">${label}:</span> <span style="${strong ? "font-weight:700;" : ""}">${value}</span>
    </div>`;

  const addressLines = [
    name,
    shipping?.address1,
    shipping?.address2,
    [shipping?.city, shipping?.state, shipping?.postalCode]
      .filter(Boolean)
      .join(", "),
    shipping?.country,
  ]
    .filter(Boolean)
    .join("<br>");

  return `
  <div style="margin:0;padding:0;background:#ffffff;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:28px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">

          <!-- header band: wordmark + tagline -->
          <tr><td style="background:${INK};padding:38px 32px 34px;" align="center">
            <img src="${LOGO_IMG}" alt="VHSMO" width="190" style="display:block;width:190px;max-width:58%;height:auto;border:0;margin:0 auto 12px;" />
            <div style="font-size:13px;letter-spacing:.4px;color:#e3e3e1;">Retro <em style="font-style:italic;">Instant</em> <strong style="font-weight:800;">Pocket</strong></div>
          </td></tr>

          <!-- greeting -->
          <tr><td style="padding:34px 32px 0;">
            <div style="font-size:20px;font-weight:700;color:${INK};">Thank you, ${name}!</div>
            <div style="margin-top:6px;font-size:16px;font-weight:600;color:${INK};">Your purchase is officially confirmed.</div>
            <p style="margin:18px 0 0;font-size:14px;line-height:1.7;color:${MUTE};">Thanks for sticking with us and trusting VHSMO with the way you capture your memories.</p>

          </td></tr>

          <tr><td style="padding:26px 32px 4px;"><div style="border-top:1px solid ${LINE};"></div></td></tr>

          <!-- order summary -->
          <tr><td style="padding:16px 32px 0;">
            <div style="font-size:13px;font-weight:700;letter-spacing:.6px;color:${INK};text-transform:uppercase;">Order Summary</div>
          </td></tr>
          <tr><td style="padding:10px 32px 0;">
            ${summaryRow("Order ID", orderId)}
            ${summaryRow("Payment ID", paymentId)}
            ${summaryRow("Amount Paid", money(total), true)}
          </td></tr>

          <tr><td style="padding:24px 32px 4px;"><div style="border-top:1px solid ${LINE};"></div></td></tr>

          <!-- shipping address -->
          <tr><td style="padding:16px 32px 0;">
            <div style="font-size:13px;font-weight:700;letter-spacing:.6px;color:${INK};text-transform:uppercase;">Shipping Address</div>
          </td></tr>
          <tr><td style="padding:10px 32px 0;">
            <div style="font-size:14px;line-height:1.8;color:${INK};">${addressLines}</div>
          </td></tr>

          <tr><td style="padding:24px 32px 4px;"><div style="border-top:1px solid ${LINE};"></div></td></tr>

          <!-- closing -->
          <tr><td style="padding:18px 32px 0;">
            <p style="margin:0;font-size:14px;line-height:1.7;color:${INK};">We're getting your camera ready and will let you know as soon as it ships.</p>
          </td></tr>

          <!-- view order cta -->
          <tr><td style="padding:22px 32px 32px;">
            <a href="${orderUrl}" style="display:block;text-align:center;background:${ACCENT};color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:15px;border-radius:10px;">View order</a>
          </td></tr>

          <!-- footer band: socials + fine print -->
          <tr><td style="background:${INK};padding:30px 32px 32px;" align="center">
            <div style="font-size:13px;color:#b8b3ae;">
              <a href="https://www.instagram.com/vhsmo.cam_/" style="color:#b8b3ae;text-decoration:none;">Instagram</a>
              &nbsp;&nbsp;·&nbsp;&nbsp;
              <a href="https://www.youtube.com/@vhsmo" style="color:#b8b3ae;text-decoration:none;">YouTube</a>
              &nbsp;&nbsp;·&nbsp;&nbsp;
              <a href="https://x.com/vhsmo_cam" style="color:#b8b3ae;text-decoration:none;">Twitter/X</a>
            </div>
            <p style="margin:16px 0 0;font-size:11px;line-height:1.6;color:#8a857f;">© ${new Date().getFullYear()} VHSMO · You're receiving this because you placed an order with us.</p>
          </td></tr>

        </table>
      </td></tr>
    </table>
  </div>`;
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
    .from("orders")
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
    .from("orders")
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

  const orderUrl = `${origin}/checkout/success?order=${encodeURIComponent(
    razorpayOrderId,
  )}&payment=${encodeURIComponent(razorpayPaymentId)}`;

  try {
    await sendEmail({
      to: order.email,
      subject: `Your VHSMO order ${razorpayOrderId} is confirmed`,
      html: orderConfirmationEmail({
        name: order.customer_name,
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
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