/**
 * Shared helpers for /track-order - used by both the form and the API route so
 * the two read customer input the same way.
 *
 * Shipments live in the Supabase `order_tracking` table (a WareIQ export).
 * Its `order_id` is `VHSMO-<suffix>`, where the suffix is the Razorpay order ID
 * after `order_` - so `order_TH12ab…` ships as `VHSMO-TH12ab…`. The suffix is
 * mixed-case and must be kept exactly; only the prefix is case-insensitive.
 *
 * `order_tracking.customer_phone` is masked by WareIQ (`98765xxxxx`), so phone
 * lookups go through `orders.phone` instead - see the API route.
 */

import type { LiveTracking } from "@/lib/wareiq/types";

export const TRACKING_BASE_URL = "https://wareiq.wiq.app/tracking/";

/** Max characters accepted in the single search box. */
export const QUERY_MAX = 64;

const SUFFIX_RE = /^[A-Za-z0-9]{6,30}$/;

/**
 * `order_XXXX`, `VHSMO-XXXX` (any case, `-` or `_`), or the bare `XXXX` →
 * `VHSMO-XXXX`. Returns null when what's left isn't a plausible ID.
 */
export function normalizeOrderId(input: string): string | null {
  const compact = input.trim().replace(/\s+/g, "");
  const suffix = compact.replace(/^(order|vhsmo)[-_]?/i, "");
  return SUFFIX_RE.test(suffix) ? `VHSMO-${suffix}` : null;
}

/** `VHSMO-XXXX` → `order_XXXX`, the form stored in `orders.razorpay_order_id`. */
export function toRazorpayOrderId(vhsmoId: string): string {
  return vhsmoId.replace(/^VHSMO-/, "order_");
}

/** `order_XXXX` → `VHSMO-XXXX`, the form stored in `order_tracking.order_id`. */
export function toTrackingOrderId(razorpayId: string): string {
  return razorpayId.replace(/^order_/, "VHSMO-");
}

/**
 * Any Indian mobile format (`98765 43210`, `+91 98765-43210`, `098765…`) → the
 * bare 10 digits. Returns null for anything else.
 */
export function normalizePhone(input: string): string | null {
  let d = input.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d.length === 10 ? d : null;
}

export type TrackQuery =
  | { kind: "orderId"; value: string }
  | { kind: "phone"; value: string };

/**
 * One box takes either. Input made only of digits, spaces, `+`, `-` and
 * brackets is a phone number; anything with a letter or `_` is an order ID.
 */
export function detectQuery(input: string): TrackQuery | null {
  const raw = input.trim();
  if (!raw || raw.length > QUERY_MAX) return null;
  if (/^[\d\s+()-]+$/.test(raw)) {
    const phone = normalizePhone(raw);
    return phone ? { kind: "phone", value: phone } : null;
  }
  const orderId = normalizeOrderId(raw);
  return orderId ? { kind: "orderId", value: orderId } : null;
}

/** Human-readable reason `detectQuery` rejected the input. */
export function queryError(input: string): string {
  const raw = input.trim();
  if (!raw) return "Enter your order ID or phone number.";
  if (/^[\d\s+()-]+$/.test(raw)) return "Enter a valid 10-digit phone number.";
  return "That doesn't look like an order ID - it starts with order_ and is in your confirmation email.";
}

export function trackingUrl(awb: string): string {
  return `${TRACKING_BASE_URL}${encodeURIComponent(awb.trim())}`;
}

/**
 * The only order fields the API ever sends to the browser. `awb` and
 * `trackingUrl` are null for a paid order that hasn't shipped yet.
 */
export type Shipment = {
  orderId: string;
  awb: string | null;
  status: string | null;
  courier: string | null;
  product: string | null;
  orderDate: string | null;
  expectedDelivery: string | null;
  deliveredDate: string | null;
  trackingUrl: string | null;
  /** Live data scraped from WareIQ; null when unavailable (falls back to DB). */
  live: LiveTracking | null;
};
