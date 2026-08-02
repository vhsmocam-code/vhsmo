import { calculateDiscount } from "@/lib/coupons/calculateDiscount";
import { getCoupon } from "@/lib/coupons/getCoupon";
import { validateCoupon } from "@/lib/coupons/validateCoupon";
import { loadProductPrices } from "@/lib/pricing/products";
import { CURRENCY, calculateShipping, calculateTax } from "@/lib/pricing/rates";

/** The only per-line data the client is trusted to send. */
export interface OrderItemInput {
  productId: string;
  quantity: number;
}

/** A priced line, built entirely from backend data. */
export interface OrderLine {
  productId: string;
  name: string;
  variant: string;
  quantity: number;
  price: number;
  total: number;
}

/** The full, backend-authored money breakdown for an order. */
export interface OrderPricing {
  lineItems: OrderLine[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  couponCode: string | null;
  total: number;
  currency: string;
}

export type CalculateOrderResult =
  | { ok: true; pricing: OrderPricing }
  | { ok: false; status: number; message: string };

/**
 * The single source of truth for order pricing. Given only product ids,
 * quantities and an optional coupon code, it rebuilds every number the charge
 * depends on from backend data. Anything the client may have claimed about
 * price, subtotal, tax, shipping, discount or total is ignored.
 */
export async function calculateOrder({
  items,
  couponCode,
}: {
  items: OrderItemInput[];
  couponCode?: string | null;
}): Promise<CalculateOrderResult> {
  // 1. Normalise the requested lines - keep only id + a sane quantity.
  const requested = (Array.isArray(items) ? items : [])
    .map((item) => ({
      productId: String(item?.productId ?? ""),
      quantity: Math.max(1, Math.floor(Number(item?.quantity) || 0)),
    }))
    .filter((item) => item.productId);

  if (requested.length === 0) {
    return { ok: false, status: 400, message: "No items in order" };
  }

  // 2. Load real prices, then 3. build priced lines and the subtotal from them.
  const prices = await loadProductPrices(requested.map((i) => i.productId));

  const lineItems: OrderLine[] = [];
  for (const item of requested) {
    const product = prices.get(item.productId);
    if (!product) {
      return {
        ok: false,
        status: 400,
        message: `Unknown or unavailable product: ${item.productId}`,
      };
    }
    lineItems.push({
      productId: product.id,
      name: product.name,
      variant: product.variant,
      quantity: item.quantity,
      price: product.price,
      total: product.price * item.quantity,
    });
  }

  const subtotal = lineItems.reduce((sum, line) => sum + line.total, 0);

  // 4 + 5. Shipping and tax, from the central rate rules.
  const shippingCost = calculateShipping(subtotal);
  const tax = calculateTax(subtotal);

  // 6. Apply a coupon, but only if one was sent and it still passes validation.
  //    We re-validate server-side because the code travelled through the
  //    browser, where it could have been swapped or the coupon since expired.
  let discount = 0;
  let appliedCode: string | null = null;

  if (couponCode) {
    const coupon = await getCoupon(couponCode);
    if (!coupon) {
      return { ok: false, status: 400, message: "Invalid coupon" };
    }

    const check = validateCoupon(coupon, subtotal);
    if (!check.valid) {
      return {
        ok: false,
        status: 400,
        message: check.message ?? "Invalid coupon",
      };
    }

    // Clamp so a fixed coupon larger than the cart can never drive it negative.
    discount = Math.min(calculateDiscount(subtotal, coupon), subtotal);
    appliedCode = coupon.code;
  }

  // 7. Final total.
  const total = Math.max(0, subtotal + shippingCost + tax - discount);

  return {
    ok: true,
    pricing: {
      lineItems,
      subtotal,
      shippingCost,
      tax,
      discount,
      couponCode: appliedCode,
      total,
      currency: CURRENCY,
    },
  };
}
