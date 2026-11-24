import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isAuthorized } from "@/lib/easyecom/auth-guard";
import { processOrder } from "@/lib/easyecom";
import { TABLE } from "@/lib/easyecom/store";

/**
 * Manual retry of a FAILED queue row. Only call this after checking EasyEcom
 * that the order does not already exist - an ambiguous failure may have been created.
 * POST { "orderNumber": "order_XXXX" } with  Authorization: Bearer $CRON_SECRET
 */
export async function POST(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { orderNumber } = (await req.json().catch(() => ({}))) as { orderNumber?: string };
  if (!orderNumber || typeof orderNumber !== "string") {
    return NextResponse.json({ error: "orderNumber required" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: "pending", attempts: 0, next_retry_at: null, lease_expires_at: null, sent_at: null, error_message: null, updated_at: new Date().toISOString() })
    .eq("orderNumber", orderNumber)
    .eq("status", "failed")
    .select("id");
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  if (!data?.length) return NextResponse.json({ error: "No failed row for that order" }, { status: 404 });
  return NextResponse.json({ ok: true, result: await processOrder(orderNumber) });
}
