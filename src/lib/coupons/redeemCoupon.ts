import { supabase } from "@/lib/supabase";

export interface RedeemCouponResult {
  redeemed: boolean;
  reason?: "not_found" | "limit_reached" | "error";
}

/**
 * Increments a coupon's `used_count` by one, after payment is confirmed.
 *
 * The bump is a compare-and-swap loop (the same pattern as decrementStock in
 * finalizeOrder): read `used_count`, then update only while it is still below
 * `usage_limit` AND unchanged since the read. If two payments land at the same
 * instant, only one update matches the guard; the other re-reads, sees the new
 * count, and stops - so a limited coupon can never exceed its cap.
 */
export async function redeemCoupon(code: string): Promise<RedeemCouponResult> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { redeemed: false, reason: "not_found" };
console.log("redeemCoupon called:", code);
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("id, used_count, usage_limit")
      .eq("code", normalized)
      .maybeSingle();

    if (error) return { redeemed: false, reason: "error" };
    if (!coupon) return { redeemed: false, reason: "not_found" };
    if (coupon.used_count >= coupon.usage_limit) {
      return { redeemed: false, reason: "limit_reached" };
    }
  console.log("coupon found:", coupon);

    const { data: updated, error: updateError } = await supabase
      .from("coupons")
      .update({ used_count: coupon.used_count + 1 })
      .eq("id", coupon.id)
      .eq("used_count", coupon.used_count) // compare-and-swap guard
      .select("id");
console.log("Updating coupon", {
  id: coupon.id,
  current: coupon.used_count,
  next: coupon.used_count + 1,
});
    if (updateError) return { redeemed: false, reason: "error" };
    if (!updated?.length) continue; // lost the race - re-read and retry
    return { redeemed: true };
  }

  // Exhausted retries under heavy contention.
  return { redeemed: false, reason: "error" };
}
