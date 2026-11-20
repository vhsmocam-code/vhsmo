import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  detectQuery,
  queryError,
  toRazorpayOrderId,
  toTrackingOrderId,
  trackingUrl,
  type Shipment,
} from "@/lib/track-order";
import { fetchWareiqTracking } from "@/lib/wareiq/tracking";
import type { LiveTracking } from "@/lib/wareiq/types";

/**
 * /track-order lookup. Takes one `query` - an order ID in any of its forms or
 * the phone number on the order - and returns the matching orders with their
 * shipment details so the page can open WareIQ tracking for the AWB.
 *
 * Orders come from `final_orders` (keyed by `razorpay_order_id`, `order_XXXX`);
 * shipments from `order_tracking` (keyed by `VHSMO-XXXX`, the same suffix).
 *
 * - Order ID: normalised, then matched on both tables.
 * - Phone: `order_tracking.customer_phone` is masked by WareIQ, so we match
 *   `final_orders.phone`, map each `order_XXXX` to `VHSMO-XXXX`, then fetch
 *   those shipments.
 *
 * A paid order with no tracking row yet is still returned (with a null AWB) so
 * the customer sees "preparing to ship" rather than "not found".
 *
 * Only order/shipment fields leave the server - never name, address, email or
 * amounts - so a phone lookup can't be used to harvest customer details.
 */

const TRACKING_COLUMNS =
  "order_id, awb, status, courier, product, order_date, expected_delivery_date, delivered_date";
const ORDER_COLUMNS = "razorpay_order_id, created_at, items";

type TrackingRow = {
  order_id: string;
  awb: string | null;
  status: string | null;
  courier: string | null;
  product: string | null;
  order_date: string | null;
  expected_delivery_date: string | null;
  delivered_date: string | null;
};

type OrderRow = {
  razorpay_order_id: string;
  created_at: string | null;
  items: unknown;
};

// Best-effort per-IP throttle. In-memory, so it only holds per serverless
// instance - a speed bump against scripted phone enumeration, not a hard limit.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const hits = new Map<string, { count: number; resetAt: number }>();

function throttled(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt <= now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
    }
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

/** `[{ name, variant, quantity }]` → "VHSMO Vol. 1 (Cherry Red)". */
function describeItems(items: unknown): string | null {
  if (!Array.isArray(items)) return null;
  const parts = items
    .map((i) => {
      if (!i || typeof i !== "object") return null;
      const { name, variant, quantity } = i as Record<string, unknown>;
      if (typeof name !== "string") return null;
      let label = typeof variant === "string" ? `${name} (${variant})` : name;
      if (typeof quantity === "number" && quantity > 1) label += ` ×${quantity}`;
      return label;
    })
    .filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function buildShipment(
  orderId: string,
  order: OrderRow | undefined,
  track: TrackingRow | undefined,
): Shipment {
  const awb = track?.awb?.trim() || null;
  return {
    orderId,
    awb,
    status: awb ? (track?.status ?? null) : "PREPARING TO SHIP",
    courier: awb ? (track?.courier ?? null) : null,
    product: describeItems(order?.items) ?? track?.product ?? null,
    orderDate: order?.created_at ?? track?.order_date ?? null,
    expectedDelivery: track?.expected_delivery_date ?? null,
    deliveredDate: track?.delivered_date ?? null,
    trackingUrl: awb ? trackingUrl(awb) : null,
    live: null,
  };
}

/** How many shipments per lookup get live WareIQ data (newest first). */
const MAX_LIVE = 5;

/**
 * Swap the stale DB status for WareIQ's live one. Only AWBs from our own
 * `order_tracking` rows are ever fetched - never user input - so this can't
 * be used as an open proxy.
 */
async function attachLive(shipments: Shipment[]): Promise<Shipment[]> {
  const targets = shipments.filter((s) => s.awb).slice(0, MAX_LIVE);
  const results = await Promise.allSettled(
    targets.map(async (s) => [s.orderId, await fetchWareiqTracking(s.awb!)] as const),
  );
  const live = new Map<string, LiveTracking>();
  for (const r of results) {
    if (r.status === "fulfilled" && r.value[1]) live.set(r.value[0], r.value[1]);
  }
  return shipments.map((s) => {
    const l = live.get(s.orderId);
    if (!l) return s;
    return {
      ...s,
      live: l,
      status: l.status,
      courier: l.courier ?? s.courier,
    };
  });
}

/** Shipments for these `VHSMO-` ids, keyed by id. */
async function fetchTracking(ids: string[]) {
  const map = new Map<string, TrackingRow>();
  if (ids.length === 0) return map;
  const { data, error } = await supabase
    .from("order_tracking")
    .select(TRACKING_COLUMNS)
    .in("order_id", ids)
    .returns<TrackingRow[]>();
  if (error) throw error;
  for (const row of data ?? []) map.set(row.order_id, row);
  return map;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (throttled(ip)) {
    return NextResponse.json(
      {
        success: false,
        message: "Too many lookups - please wait a minute and try again.",
      },
      { status: 429 },
    );
  }

  try {
    const body = await req.json().catch(() => null);
    const raw = typeof body?.query === "string" ? body.query : "";
    const query = detectQuery(raw);
    if (!query) {
      return NextResponse.json(
        { success: false, message: queryError(raw) },
        { status: 400 },
      );
    }

    let orders: OrderRow[] = [];

    if (query.kind === "orderId") {
      const { data, error } = await supabase
        .from("final_orders")
        .select(ORDER_COLUMNS)
        .eq("razorpay_order_id", toRazorpayOrderId(query.value))
        .limit(1)
        .returns<OrderRow[]>();
      if (error) throw error;
      orders = data ?? [];
    } else {
      const d = query.value;
      // final_orders.phone is stored as `9876543210`, `+919876543210` or
      // `98765 43210` - the suffix match covers the first two.
      const { data, error } = await supabase
        .from("final_orders")
        .select(ORDER_COLUMNS)
        .or(`phone.ilike.%${d},phone.eq."${d.slice(0, 5)} ${d.slice(5)}"`)
        .order("created_at", { ascending: false })
        .limit(20)
        .returns<OrderRow[]>();
      if (error) throw error;
      orders = (data ?? []).filter((o) =>
        o.razorpay_order_id?.startsWith("order_"),
      );
    }

    // Dedupe by order id, newest first.
    const byId = new Map<string, OrderRow>();
    for (const o of orders) {
      const id = toTrackingOrderId(o.razorpay_order_id);
      if (!byId.has(id)) byId.set(id, o);
    }

    // An order ID with no final_orders row may still have a shipment (orders
    // created outside the site), so always check tracking for it.
    const ids =
      query.kind === "orderId" ? [query.value] : [...byId.keys()];
    const tracking = await fetchTracking(ids);

    const shipments = await attachLive(
      ids
        .filter((id) => byId.has(id) || tracking.has(id))
        .map((id) => buildShipment(id, byId.get(id), tracking.get(id))),
    );

    if (shipments.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            query.kind === "orderId"
              ? "We couldn't find an order with that ID. Check it against your confirmation email."
              : "We couldn't find an order with that phone number. Try the number you used at checkout, or your order ID.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, shipments });
  } catch (err) {
    console.error("track order:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong - please try again in a moment.",
      },
      { status: 500 },
    );
  }
}
