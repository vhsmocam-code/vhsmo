type Coupon = {
  type: "fixed" | "percentage";
  value: number;
};

export function calculateDiscount(subtotal: number, coupon: Coupon) {
  if (coupon.type === "fixed") {
    return coupon.value;
  }

  return Math.round((subtotal * coupon.value) / 100);
}
