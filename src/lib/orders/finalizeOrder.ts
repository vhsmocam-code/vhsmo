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