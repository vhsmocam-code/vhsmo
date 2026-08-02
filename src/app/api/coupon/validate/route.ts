import { calculateDiscount } from "@/lib/coupons/calculateDiscount";
import { getCoupon } from "@/lib/coupons/getCoupon";
import { validateCoupon } from "@/lib/coupons/validateCoupon";
import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal, email } = await req.json();

await supabase.from("coupon_inputs").insert({
  code: code.trim().toUpperCase(),
    email: email,
});
    if (!code) {
      return NextResponse.json(
        { valid: false, message: "Enter a coupon code" },
        { status: 400 },
      );
    }

    const coupon = await getCoupon(code);

    if (!coupon) {
      return NextResponse.json(
        { valid: false, message: "Invalid coupon" },
        { status: 404 },
      );
    }

    const result = validateCoupon(coupon, subtotal);

    if (!result.valid) {
      return NextResponse.json(result);
    }

    const discount = calculateDiscount(subtotal, coupon);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount,
      total: subtotal - discount,
    });
  } catch (error) {
    console.error("coupon validate failed:", error);

    return NextResponse.json(
      { valid: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
