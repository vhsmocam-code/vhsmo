import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * "Notify me" restock signups - when a finish is sold out the purchase panel
 * swaps the buy button for a "Notify me" one that opens a small form. Buyers
 * leave their name, phone and email so we can ping them when that finish is
 * back. Rows land in the Supabase `stock_notifications` table; `product_id`,
 * `sku` and `variant` record which finish they're waiting on.
 */
export async function POST(req: Request) {
  try {
    const { name, email, phone, sku, variant } = await req.json();

    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanEmail =
      typeof email === "string" ? email.toLowerCase().trim() : "";
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";
    const cleanSku = typeof sku === "string" ? sku.trim() : "";
    const cleanVariant = typeof variant === "string" ? variant.trim() : "";

    if (!cleanName) {
      return NextResponse.json(
        { success: false, message: "Enter your name." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email." },
        { status: 400 },
      );
    }

    // Digits only, ignoring the usual +, spaces, dashes and brackets.
    // 7-15 digits: below 7 is too short to be real, 15 is the E.164 ceiling.
    const phoneDigits = cleanPhone.replace(/[^\d]/g, "").length;
    if (phoneDigits < 7 || phoneDigits > 15) {
      return NextResponse.json(
        { success: false, message: "Enter a valid phone number." },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("stock_notifications").insert({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      sku: cleanSku || null,
      variant: cleanVariant || null,
    });

    if (error) {
      console.error("stock notification insert:", error);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("notify me:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
