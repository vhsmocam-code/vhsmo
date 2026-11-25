/** Dispatch and delivery promises the whole site quotes, so every shipping line stays in step. */
export const DISPATCH_ETA = "48–72 hours";
export const DELIVERY_ETA = "2–7 business days";
export const DELIVERY_ETA_REMOTE = "7–12 business days";
/** The full delivery promise, including remote locations. */
export const DELIVERY_NOTE = `${DELIVERY_ETA} (${DELIVERY_ETA_REMOTE} for remote locations across India)`;

const DAY_MS = 86_400_000;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function isWeekendIST(d: Date): boolean {
  const day = new Date(d.getTime() + IST_OFFSET_MS).getUTCDay();
  return day === 0 || day === 6;
}

function addBusinessDays(from: Date, days: number): Date {
  let d = new Date(from.getTime());
  let left = days;
  while (left > 0) {
    d = new Date(d.getTime() + DAY_MS);
    if (!isWeekendIST(d)) left -= 1;
  }
  return d;
}

/**
 * The delivery date range quoted on the order confirmation, built from the
 * same promises as the constants above: dispatch within 2-3 days of the order,
 * then 2-7 business days in transit (7-12 for remote locations). Business days
 * are Mon-Fri in IST; public holidays are not modelled, so it is an estimate.
 */
export function estimateDeliveryWindow(
  placedAt: number | Date,
  remote = false,
): { from: Date; to: Date } {
  const placed = new Date(placedAt);
  const dispatchFrom = new Date(placed.getTime() + 2 * DAY_MS);
  const dispatchTo = new Date(placed.getTime() + 3 * DAY_MS);
  return {
    from: addBusinessDays(dispatchFrom, remote ? 7 : 2),
    to: addBusinessDays(dispatchTo, remote ? 12 : 7),
  };
}

/** "27 Nov" in IST, whatever timezone the visitor is in. */
export function formatDeliveryDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
}
