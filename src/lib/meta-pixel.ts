/**
 * Browser-side Meta Pixel helpers. The pixel script itself is loaded by
 * <MetaPixel /> (src/components/analytics/MetaPixel.tsx).
 *
 * Calls made before fbevents.js has loaded (e.g. an effect that runs during
 * hydration) are queued and replayed by <MetaPixel /> once the script is ready.
 * Every helper is a safe no-op on the server.
 */

// The pixel ID is public (it ships in the page source), so it lives in code;
// the env var is only an optional override.
export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "1527022562679386";
export const META_CURRENCY = "INR";

type Fbq = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

const pending: unknown[][] = [];

function send(args: unknown[]) {
  if (typeof window === "undefined") return;
  if (typeof window.fbq === "function") {
    try {
      window.fbq(...args);
    } catch {
      /* tracking must never break the page */
    }
  } else {
    pending.push(args);
  }
}

/** Called by <MetaPixel /> once the script has run; replays queued events. */
export function flushPending() {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  while (pending.length) {
    const args = pending.shift()!;
    try {
      window.fbq(...args);
    } catch {
      /* ignore */
    }
  }
}

/** Standard event. `eventId` lets Meta dedupe repeats of the same event. */
export function pixel(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string,
) {
  send(
    eventId
      ? ["track", event, params ?? {}, { eventID: eventId }]
      : ["track", event, params ?? {}],
  );
}

interface LineLike {
  id?: string;
  quantity: number;
  price: number;
}

/** content_ids / contents / value / num_items for a list of cart or order lines. */
export function buildContents(lines: LineLike[], value?: number) {
  const valid = lines.filter((l) => l.id);
  return {
    content_type: "product",
    content_ids: valid.map((l) => l.id as string),
    contents: valid.map((l) => ({
      id: l.id as string,
      quantity: l.quantity,
      item_price: l.price,
    })),
    num_items: lines.reduce((sum, l) => sum + l.quantity, 0),
    value: value ?? lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    currency: META_CURRENCY,
  };
}
