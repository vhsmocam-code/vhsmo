import { hasLaunched } from "@/lib/launch";
import { calculateOrder } from "@/lib/orders/calculateOrder";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { ORDERS_TABLE } from "@/lib/orders/table";
import { confirmCodOrder } from "@/lib/orders/finalizeOrder";
import { codEnabled, codSecret, otpChannel } from "@/lib/cod/config";
import {
  COD_MAX_ORDERS_PER_EMAIL_24H,
  COD_MAX_ORDERS_PER_IP_24H,
  COD_MAX_ORDERS_PER_PHONE_24H,
  cleanEmail,
  generateCodOrderId,
  normalizeEmail,
  normalizeIndianMobile,
  parseContact,
  verifyOtpToken,
} from "@/lib/cod/core";
import { clientIp, codOrdersFromIp, consumeOtp, releaseOtp } from "@/lib/cod/otp";
import { isValidPincode, lookupPincode } from "@/lib/pincode";

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
  /** "prepaid" (default, Razorpay) or "cod". */
  paymentMethod?: string;
  /** COD only: the token /api/cod/otp/verify returned. */
  otpToken?: string;
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

    if (body.paymentMethod === "cod") {
      return await createCodOrder(req, body);
    }
    if (body.paymentMethod != null && body.paymentMethod !== "prepaid") {
      return NextResponse.json(
        { message: "Unknown payment method" },
        { status: 400 },
      );
    }

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

    const { error } = await supabase.from(ORDERS_TABLE).insert({
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
      payment_method: "prepaid",

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

const bad = (message: string, status = 400) =>
  NextResponse.json({ message }, { status });

/**
 * Cash on Delivery. No Razorpay order: the phone is proven by a one-use OTP
 * token, the courier's COD coverage is re-checked here, and the order is
 * confirmed immediately (stock, email, EasyEcom with paymentMode 2).
 */
async function createCodOrder(req: Request, body: CreateOrderBody) {
  if (!codEnabled()) return bad("Cash on Delivery is not available", 403);
  const secret = codSecret();
  if (!secret) return bad("Cash on Delivery is unavailable right now", 503);

  const { customer, shipping, items } = body;
  if (!customer?.name?.trim() || !customer?.email?.trim()) {
    return bad("Missing customer details");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
    return bad("Enter a valid email address");
  }
  if (!shipping?.address1?.trim() || !shipping?.city?.trim() || !shipping?.state?.trim()) {
    return bad("Missing shipping details");
  }
  if ((shipping.country ?? "").trim().toLowerCase() !== "india") {
    return bad("Cash on Delivery is only available in India");
  }
  const pincode = (shipping.postalCode ?? "").replace(/\D/g, "");
  if (!isValidPincode(pincode)) return bad("Enter a valid 6-digit PIN code");

  const phone = normalizeIndianMobile(customer.phone);
  if (!phone) return bad("Enter a valid 10-digit Indian mobile number");

  // 1. Ownership: the OTP token must be valid, unexpired and for THIS contact
  //    (the order's email by default, the phone on the SMS channel).
  const channel = otpChannel();
  const contactCheck = parseContact(channel, { email: customer.email, phone: customer.phone });
  if (!contactCheck.ok) return bad(contactCheck.message);
  const contact = contactCheck.contact;
  const token = verifyOtpToken(secret, body.otpToken, contact);
  if (!token.ok) return bad(token.reason, 401);

  // 2. Price on the server: full price + COD fee, no coupon, stock checked.
  const result = await calculateOrder({
    items: items ?? [],
    couponCode: body.couponCode ?? null,
    paymentMethod: "cod",
  });
  if (!result.ok) return bad(result.message, result.status);
  const { pricing } = result;

  // 3. Repeat-order limits: per phone, per mailbox (dots / +tags collapsed) and per IP.
  const since = new Date(Date.now() - 24 * 3_600_000).toISOString();
  const { data: recentCod, error: countError } = await supabase
    .from(ORDERS_TABLE)
    .select("phone, email")
    .eq("payment_method", "cod")
    .gte("created_at", since)
    .limit(1000);
  if (countError) throw countError;
  const mailbox = normalizeEmail(customer.email);
  const byPhone = (recentCod ?? []).filter((o) => o.phone === phone).length;
  const byEmail = (recentCod ?? []).filter((o) => normalizeEmail(o.email) === mailbox).length;
  if (
    byPhone >= COD_MAX_ORDERS_PER_PHONE_24H ||
    byEmail >= COD_MAX_ORDERS_PER_EMAIL_24H ||
    (await codOrdersFromIp(clientIp(req))) >= COD_MAX_ORDERS_PER_IP_24H
  ) {
    return bad(
      "You've reached the Cash on Delivery limit for today. Please pay online or try again tomorrow.",
      429,
    );
  }

  // 4. The courier must collect cash at this PIN. Fail closed.
  const service = await lookupPincode(pincode);
  if (service.kind !== "serviceable") {
    return bad(
      service.kind === "unserviceable"
        ? "We don't deliver to this PIN code yet"
        : "We couldn't confirm Cash on Delivery for this PIN code. Please pay online or try again.",
      service.kind === "unserviceable" ? 400 : 502,
    );
  }
  if (!service.cod) {
    return bad("Cash on Delivery isn't available for this PIN code. Please pay online.");
  }

  // 5. Spend the OTP (once), then save and confirm the order.
  if (!(await consumeOtp(token.otpId, channel, contact))) {
    return bad("This verification was already used. Please verify again.", 401);
  }

  const orderId = generateCodOrderId();
  const { error } = await supabase.from(ORDERS_TABLE).insert({
    razorpay_order_id: orderId,

    customer_name: customer.name.trim(),
    email: cleanEmail(customer.email),
    phone,

    address_line1: shipping.address1,
    address_line2: shipping.address2,
    city: shipping.city,
    state: shipping.state,
    country: "India",
    postal_code: pincode,

    currency: pricing.currency,
    items: pricing.lineItems,

    subtotal: pricing.subtotal,
    shipping_cost: pricing.shippingCost,
    tax: pricing.tax,
    discount: 0,
    coupon_code: null,
    cod_fee: pricing.codFee,
    total: pricing.total,
    amount: pricing.total,
    payment_method: "cod",
    payment_status: "pending",
  });

  if (error) {
    console.error("Supabase error creating COD order:", error);
    await releaseOtp(token.otpId).catch(() => {});
    return bad("Failed to create order in database", 500);
  }

  await confirmCodOrder({ orderId, req });

  return NextResponse.json({
    id: orderId,
    method: "cod",
    total: pricing.total,
    codFee: pricing.codFee,
    currency: pricing.currency,
  });
}
