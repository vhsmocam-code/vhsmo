import { z } from "zod";

/**
 * ONE-TIME order-recovery flow. A handful of customers paid through Razorpay
 * but a backend fault meant their order was never written to `orders` - only
 * the payment landed, in `incomplete_orders`. Each affected buyer gets a
 * unique `recovery_token`; the page at /complete-order/[token] lets them fill
 * in shipping details, and /api/complete-order writes the real `orders` row
 * and flips `incomplete_orders.completed` to true. Delete this flow once all
 * four customers are through.
 *
 * This module is the single source of truth shared by the client form and the
 * API route: the Zod schema, the colour options, and the colour -> product
 * mapping.
 */

/** The three finishes offered on the recovery form. */
export const RECOVERY_COLORS = ["Cosmic Black", "Cherry Red", "Baby Pink"] as const;
export type RecoveryColor = (typeof RECOVERY_COLORS)[number];

/**
 * Form colour label -> the `color` string stored on the matching `products`
 * row. "Black" is sold as "Cosmic Black" in the catalogue; the other two match
 * verbatim. The API looks the product up by this value so the recovered
 * `orders.items` line carries the real product id, name and price rather than
 * anything the client sent.
 */
export const COLOR_TO_PRODUCT_COLOR: Record<RecoveryColor, string> = {
  "Cosmic Black": "Cosmic Black",
  "Cherry Red": "Cherry Red",
  "Baby Pink": "Baby Pink",
};

const trimmed = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label} is required.`)
    .max(max, `${label} is too long.`);

/**
 * What the form collects and the API validates. Everything money- or
 * payment-related (email, amount, razorpay ids) comes from the trusted
 * `incomplete_orders` row on the server, never from this payload - so it is
 * deliberately NOT part of the schema.
 */
export const recoverySchema = z.object({
  token: z.string().trim().min(1),
  customerName: trimmed(2, 80, "Full name"),
  // 7-15 digits after stripping the usual separators - covers Indian mobiles
  // and the odd landline without being fussy about format.
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[^\d]/g, ""))
    .pipe(
      z
        .string()
        .min(7, "Enter a valid phone number.")
        .max(15, "Enter a valid phone number."),
    ),
  // Street address (checkout's "street"); line 2 is the optional apartment /
  // flat / landmark line, mirroring checkout's "apartment".
  addressLine1: trimmed(4, 120, "Street address"),
  addressLine2: z
    .string()
    .trim()
    .max(120, "Address line 2 is too long.")
    .optional()
    .default(""),
  city: trimmed(2, 60, "City"),
  state: trimmed(2, 60, "State"),
  // Indian PIN codes are exactly 6 digits and never start with 0 - the same
  // rule checkout's serviceability check uses.
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode."),
  color: z.enum(RECOVERY_COLORS, {
    message: "Pick a colour.",
  }),
});

// These buyers each paid for exactly one unit, so quantity is always 1 - it is
// no longer a form field.
export const RECOVERY_QUANTITY = 1;

export type RecoveryInput = z.input<typeof recoverySchema>;
export type RecoveryOutput = z.output<typeof recoverySchema>;

/** The only fields the server ever sends to the browser about a recovery row. */
export type RecoveryClientData = {
  token: string;
  email: string;
};
