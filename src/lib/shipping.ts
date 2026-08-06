/**
 * Firm ship-by date the whole site anchors its shipping copy to. Every
 * "ships by 15 September 2026" line and the dynamic "ships in N–M weeks"
 * estimate below count toward this single date, so they never drift apart.
 */
export const SHIP_BY = new Date("2026-09-15T18:00:00+05:30");

/**
 * Human "N–M weeks" phrasing for how far out shipping is, measured from `now`
 * to {@link SHIP_BY}. Returned WITHOUT a leading verb so callers can say
 * "Shipping begins in {eta}" or "ships within {eta}".
 *
 * The window shrinks on its own as the date nears - "6–7 weeks" today becomes
 * "3–4 weeks" a month later - and degrades gracefully in the final stretch
 * ("within a week", then "very soon" once we're at or past the date).
 */
export function shipEtaWeeks(now: Date = new Date()): string {
  const weeks = (SHIP_BY.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000);

  if (weeks <= 0) return "very soon";
  if (weeks <= 1) return "within a week";

  const low = Math.floor(weeks);
  const high = Math.ceil(weeks);
  return low === high ? `${low} weeks` : `${low}–${high} weeks`;
}
