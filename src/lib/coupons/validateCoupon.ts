export type Coupon = {
  code: string;
  type: "fixed" | "percentage";
  value: number;
  usage_limit: number;
  used_count: number;
  minimum_order: number;
  active: boolean;
  expires_at: string | null;
};

export function validateCoupon(coupon: Coupon, subtotal: number) {
  // 1. Active
  if (!coupon.active) {
    return {
      valid: false,
      message: "Coupon is inactive",
    };
  }

  // 2. Expired
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return {
      valid: false,
      message: "Coupon expired",
    };
  }

  // 3. Usage limit
  if (coupon.used_count >= coupon.usage_limit) {
    return {
      valid: false,
      message: "Coupon fully redeemed",
    };
  }

  // 4. Minimum order
  if (subtotal < coupon.minimum_order) {
    return {
      valid: false,
      message: `Minimum order ₹${coupon.minimum_order}`,
    };
  }

  return {
    valid: true,
  };
}
