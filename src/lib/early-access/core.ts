// Pure early-access logic (no imports) so node:test can load it directly.

/** What a redeemed code unlocks in the app. Add features here, then gate them in the app. */
export const EARLY_ACCESS_FEATURES = ["filters"] as const;

export type RejectReason = "invalid" | "locked" | "already_used";

export type EarlyAccessRow = {
  id: string;
  locked: boolean;
  device_id: string | null;
};

export type Decision =
  | { kind: "valid" }
  | { kind: "claim"; id: string }
  | { kind: "rejected"; reason: RejectReason };

/** Uppercase, no whitespace. Returns null when it can't be a code. */
export function normalizeCode(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const code = input.replace(/\s+/g, "").toUpperCase();
  return code.length >= 4 && code.length <= 32 ? code : null;
}

/** Device ids come from the app (iOS vendor id, Android id, or a random id). */
export function normalizeDeviceId(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const id = input.trim();
  return id.length >= 8 && id.length <= 128 ? id : null;
}

/**
 * One code = one phone. The phone that holds it can redeem again (reinstall,
 * periodic re-check); any other phone is refused until support clears device_id.
 */
export function decideRedemption(
  row: EarlyAccessRow | null,
  deviceId: string,
): Decision {
  if (!row) return { kind: "rejected", reason: "invalid" };
  if (row.locked) return { kind: "rejected", reason: "locked" };
  if (row.device_id === deviceId) return { kind: "valid" };
  if (row.device_id) return { kind: "rejected", reason: "already_used" };
  return { kind: "claim", id: row.id };
}

/**
 * Best-effort fixed-window limiter. In-memory, so it only spans one serverless
 * instance; codes are long enough that guessing isn't practical anyway.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function allow(key: string, now: number = Date.now()): boolean {
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      // Keep the map from growing without bound on a long-lived instance.
      if (hits.size > 5000) {
        for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
      }
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (entry.count >= limit) return false;
    entry.count += 1;
    return true;
  };
}
