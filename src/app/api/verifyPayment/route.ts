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

/**
 * Order-confirmation email. Table-based, fully inline-styled so it survives
 * Gmail/Outlook/Apple Mail (which strip <style> and flex/grid). The header and
 * footer wordmarks are a hosted PNG; the copy between them is generated.
 */
function orderConfirmationEmail({
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

/**
 * Replace whatever the browser sent with the row the store actually sells:
 * name, colour and price come from `products`, keyed by the cart line's
 * productId. Lines that don't resolve (stale carts from before the table
 * existed) are kept verbatim so the paid order is never lossy, but they
 * can't touch stock.
 */
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

/**
 * `stock = stock - qty`, without a database function: read the row, write it
 * back guarded by the value we read. A concurrent order makes the guarded
 * update match zero rows, and the loop re-reads. Never goes below zero.
 */
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

export async function POST(req: Request) {
  try {
    const {
      payment,
      customer,
      shipping,
      items,
      subtotal,
      shippingCost,
      tax,
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

    // The cart lines carry product row ids - pull those rows so the order
    // records what the store sells, not what the browser claimed. A non-uuid
    // id (legacy carts, tampering) would make Postgres reject the whole
    // query, so those never reach it.
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
      const { data, error: productsError } = await supabase
        .from("products")
        .select("id, name, color, selling_price, stock")
        .in("id", ids);
      if (productsError) {
        console.error("Failed to load products for order:", productsError);
      }
      rows = (data as ProductRow[]) ?? [];
    }

    const { stored, resolved } = canonicalise(cartItems, rows);

    const { error } = await supabase.from("orders").insert({
      razorpay_order_id,
      razorpay_payment_id,

      customer_name: customer?.name,
      email: customer?.email,
      phone: customer?.phone,

      address_line1: shipping?.address1,
      address_line2: shipping?.address2,
      city: shipping?.city,
      state: shipping?.state,
      country: shipping?.country,
      postal_code: shipping?.postalCode,

      items: stored,

      subtotal,
      shipping_cost: shippingCost,
      tax,
      total,
      amount: total,
      currency: "INR",
      payment_status: "paid",
    });

    if (error) {
      console.error("Failed to save order:", error);
      return NextResponse.json(
        { success: false, message: "Payment verified but order not saved" },
        { status: 500 },
      );
    }

    // The payment is real and the order is saved - take the units out of
    // stock. A failure here is logged, never surfaced: the customer paid.
    for (const { row, quantity } of resolved) {
      const ok = await decrementStock(row.id, quantity);
      if (!ok) {
        console.error(
          `Order ${razorpay_order_id}: could not decrement stock for ${row.id}`,
        );
      }
    }
    // Bust the cached storefront read so the new stock shows immediately.
    revalidateTag("products");

    try {
      const origin =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
        new URL(req.url).origin;
      const orderUrl = `${origin}/checkout/success?order=${encodeURIComponent(
        razorpay_order_id,
      )}&payment=${encodeURIComponent(razorpay_payment_id)}`;

      await sendEmail({
        to: customer.email,
        subject: `Your VHSMO order ${razorpay_order_id} is confirmed`,
        html: orderConfirmationEmail({
          name: customer.name,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          total,
          orderUrl,
          shipping: {
            address1: shipping?.address1,
            address2: shipping?.address2,
            city: shipping?.city,
            state: shipping?.state,
            country: shipping?.country,
            postalCode: shipping?.postalCode,
          },
        }),
      });
    } catch (err) {
      console.error("Failed to send order email:", err);
    }

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
