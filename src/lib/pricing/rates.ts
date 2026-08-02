/**
 * Central pricing rules for the storefront. These mirror the numbers the cart
 * shows the shopper (see src/lib/cart-context.tsx) so the price on screen and
 * the amount the backend actually charges never drift apart. Change a rule
 * here and both the displayed total and the Razorpay charge move together.
 */

export const CURRENCY = "INR";

/** GST placeholder - preorders are currently tax-inclusive at 0%. */
const TAX_RATE = 0;

/** Orders at or above this subtotal ship free. 0 means always free, which is
 *  where the first production run sits today. */
const FREE_SHIPPING_THRESHOLD = 0;

/** Flat shipping charged when an order falls below the free threshold. */
const SHIPPING_FLAT = 0;

/**
 * Shipping for an order. Kept as a function of the subtotal so a
 * free-over-threshold rule can be tuned in one place without touching callers.
 */
export function calculateShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
}

/**
 * Tax on the subtotal, rounded to whole rupees so it lines up with Razorpay's
 * paise-based charge.
 */
export function calculateTax(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE);
}
