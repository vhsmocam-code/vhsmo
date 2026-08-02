import { supabase } from "@/lib/supabase";
import type { Coupon } from "./validateCoupon";

/**
 * Loads a coupon by code (case-insensitive) from Supabase, or null when no
 * such coupon exists. Shared by the coupon-validate endpoint and order
 * creation so the lookup - and the way "not found" is handled - lives in
 * exactly one place.
 */
export async function getCoupon(code: string): Promise<Coupon | null> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", normalized)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load coupon: ${error.message}`);
  }

  return (data as Coupon) ?? null;
}
