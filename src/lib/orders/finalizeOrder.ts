import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";

interface OrderItem {
  productId: string;
  name: string;
  variant?: string;
  quantity: number;
  price: number;
  total: number;
}

interface ProductRow {
  id: string;
  name: string;
  color: string;
  selling_price: number;
  stock: number | null;
}

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

function canonicalise(
  items: OrderItem[],
  rows: ProductRow[],
): { stored: OrderItem[]; resolved: { row: ProductRow; quantity: number }[] } {
  const byId = new Map(rows.map((r) => [r.id, r]));
  const stored: OrderItem[] = [];
  const resolved: { row: ProductRow; quantity: number }[] = [];

  for (const item of items) {
    const row = byId.get(item.productId);
    const quantity = Math.max(1, Math.floor(item.quantity ?? 1));
    if (!row) {
      stored.push({ ...item, quantity });
      continue;
    }
    stored.push({
      productId: row.id,
      name: row.name.trim(),
      variant: row.color,
      quantity,
      price: row.selling_price,
      total: row.selling_price * quantity,
    });
    resolved.push({ row, quantity });
  }

  return { stored, resolved };
}

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
export async function finalizeOrder({
  razorpayOrderId,
  razorpayPaymentId,
  customer,
  shipping,
  items,
  total,
  req,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  customer: any;
  shipping: any;
  items: any[];
  total: number;
  req: Request;
}) {
  // 1. Check if order exists
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();

  if (error) throw error;

  if (!order) {
    throw new Error("Order not found");
  }

  // Already processed
  if (order.payment_status === "paid") {
    return;
  }

  // 2. Load products
  const UUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const cartItems: OrderItem[] = Array.isArray(items) ? items : [];

  const ids = [
    ...new Set(
      cartItems.map((i) => i.productId).filter((id) => UUID.test(id ?? "")),
    ),
  ];

  let rows: ProductRow[] = [];

  if (ids.length) {
    const { data } = await supabase
      .from("products")
      .select("id,name,color,selling_price,stock")
      .in("id", ids);

    rows = (data as ProductRow[]) ?? [];
  }

  // 3. Canonicalise
  const { resolved } = canonicalise(cartItems, rows);

  // 4. Mark paid
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      razorpay_payment_id: razorpayPaymentId,
      amount: total,
      currency: "INR",
    })
    .eq("razorpay_order_id", razorpayOrderId)
    .eq("payment_status", "pending");

  if (updateError) throw updateError;

  // 5. Reduce stock
  for (const { row, quantity } of resolved) {
    await decrementStock(row.id, quantity);
  }

  // 6. Refresh cache
  revalidateTag("products");

  // 7. Send email
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    new URL(req.url).origin;

  const orderUrl = `${origin}/checkout/success?order=${encodeURIComponent(
    razorpayOrderId,
  )}&payment=${encodeURIComponent(razorpayPaymentId)}`;

  await sendEmail({
    to: customer.email,
    subject: `Your VHSMO order ${razorpayOrderId} is confirmed`,
    html: orderConfirmationEmail({
      name: customer.name,
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      total,
      orderUrl,
      shipping,
    }),
  });
}