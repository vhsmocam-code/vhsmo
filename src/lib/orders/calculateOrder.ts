import { COD_FEE, COD_MAX_UNITS, codTotal } from "@/lib/cod/core";
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
  /** Cash on Delivery fee - 0 for online payment. */
  codFee: number;
  total: number;
  currency: string;
}

export type PaymentMethod = "prepaid" | "cod";

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
  paymentMethod = "prepaid",
}: {
  items: OrderItemInput[];
  couponCode?: string | null;
  paymentMethod?: PaymentMethod;
}): Promise<CalculateOrderResult> {
  // Coupons are an online-payment perk; COD is always full price + COD fee.
  if (paymentMethod === "cod" && couponCode) {
    return {
      ok: false,
      status: 400,
      message: "Coupons apply to online payment only",
    };
  }

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
  const stockById = new Map<string, number | null>();
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
    stockById.set(product.id, product.stock);
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

  // 7. COD only: no stock left means no order - there's no payment step to
  //    stop it later. (Online payment keeps its existing behaviour.)
  if (paymentMethod === "cod") {
    const units = new Map<string, number>();
    for (const line of lineItems) {
      units.set(line.productId, (units.get(line.productId) ?? 0) + line.quantity);
    }
    const totalUnits = [...units.values()].reduce((a, b) => a + b, 0);
    if (totalUnits > COD_MAX_UNITS) {
      return {
        ok: false,
        status: 400,
        message: `Cash on Delivery is limited to ${COD_MAX_UNITS} cameras per order`,
      };
    }
    for (const [productId, qty] of units) {
      const stock = stockById.get(productId);
      if (stock != null && stock < qty) {
        return { ok: false, status: 409, message: "This item is out of stock" };
      }
    }
  }

  // 8. Final total.
  const codFee = paymentMethod === "cod" ? COD_FEE : 0;
  const total =
    paymentMethod === "cod"
      ? codTotal({ subtotal, shippingCost, tax })
      : Math.max(0, subtotal + shippingCost + tax - discount);

  return {
    ok: true,
    pricing: {
      lineItems,
      subtotal,
      shippingCost,
      tax,
      discount,
      couponCode: appliedCode,
      codFee,
      total,
      currency: CURRENCY,
    },
  };
}
