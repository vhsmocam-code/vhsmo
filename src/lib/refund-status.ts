/**
 * Refund requests close at 4:00 PM IST on 4 November 2026.
 *
 * Keep this as an absolute timestamp so the cutoff is not affected by the
 * server's timezone or daylight-saving rules.
 */
export const REFUND_REQUESTS_CLOSE_AT = Date.parse("2026-11-04T10:30:00.000Z");

export function areRefundRequestsOpen(now = Date.now()) {
  return now < REFUND_REQUESTS_CLOSE_AT;
}
