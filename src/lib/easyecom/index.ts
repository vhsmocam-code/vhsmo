import { supabase } from "@/lib/supabase";
import { sendAlert } from "./alerts";
import { getCreds } from "./auth";
import { easyEcomConfig } from "./config";
import {
  buildQueueRow,
  easyEcomOrderNumber,
  postOrder,
  processRow,
  safeError,
  type OrderRow,
  type ProcessResult,
  type QueueRow,
  type WorkerDeps,
} from "./core";
import { supabaseStore, TABLE } from "./store";
import { ORDERS_TABLE } from "@/lib/orders/table";

function deps(): WorkerDeps {
  const c = easyEcomConfig();
  return {
    store: supabaseStore,
    dryRun: c.dryRun,
    getCreds: () => getCreds(false),
    refreshCreds: () => getCreds(true),
    post: (creds, payload) => postOrder(creds, payload, { timeoutMs: c.timeoutMs }),
    alert: sendAlert,
  };
}

/**
 * Step 1 - called from finalizeOrder once an order is paid. Adds the order to
 * the queue (idempotent) and NEVER throws, so it can't affect checkout.
 */
export async function enqueueEasyEcomOrder(order: OrderRow): Promise<"queued" | "exists" | "skipped" | "error"> {
  try {
    const c = easyEcomConfig();
    if (!c.enabled) return "skipped";
    if (String(order.country ?? "").trim().toLowerCase() !== "india") {
      console.log(`[easyecom] ${order.razorpay_order_id}: non-India order, not sent`);
      return "skipped";
    }

    const built = buildQueueRow(order, { sendDiscount: c.sendDiscount });
    if (!built.ok) {
      await sendAlert(`EasyEcom: cannot build order ${order.razorpay_order_id}`, built.reason);
      return "error";
    }
    if (c.dryRun) {
      console.log(`[easyecom][dry-run] would queue ${built.row.orderNumber}`);
      return "skipped";
    }

    const { data: existing } = await supabase
      .from(TABLE).select("id").eq("orderNumber", built.row.orderNumber).maybeSingle();
    if (existing) return "exists";

    const { error } = await supabase.from(TABLE).insert(built.row);
    if (error) {
      if (error.code === "23505") return "exists"; // unique(orderNumber) - a concurrent call won
      throw error;
    }
    return "queued";
  } catch (e) {
    await sendAlert(`EasyEcom: enqueue failed for ${order?.razorpay_order_id}`, safeError(e));
    return "error";
  }
}

/** Step 2 - fast path right after enqueue (also usable manually). Never throws. */
export async function processOrder(razorpayOrderId: string): Promise<ProcessResult | "not-found" | "error"> {
  try {
    const c = easyEcomConfig();
    if (!c.enabled) return "skipped";
    const { data } = await supabase
      .from(TABLE).select("*").eq("orderNumber", razorpayOrderId).eq("status", "pending").maybeSingle();
    if (!data) return "not-found";
    return await processRow(deps(), data as QueueRow);
  } catch (e) {
    await sendAlert(`EasyEcom: processOrder crashed for ${razorpayOrderId}`, safeError(e));
    return "error";
  }
}

/** Rows stuck in `processing` after a crash: safe ones go back, uncertain ones go to a human. */
async function recoverStale(): Promise<number> {
  const nowIso = new Date().toISOString();
  const { data } = await supabase
    .from(TABLE).select("*").eq("status", "processing").lt("lease_expires_at", nowIso).limit(25);
  let n = 0;
  for (const row of (data ?? []) as QueueRow[]) {
    if (!row.sent_at) {
      // Never reached the POST: nothing was created, safe to retry.
      await supabaseStore.update(row.id, { status: "pending", lease_expires_at: null }, "processing");
    } else {
      await supabaseStore.update(row.id, {
        status: "failed", lease_expires_at: null, processed_at: nowIso,
        error_message: "Worker stopped after sending; outcome unknown - verify in EasyEcom before retrying.",
      }, "processing");
      await sendAlert(`EasyEcom: order ${row.orderNumber} needs a manual check`,
        `A send was interrupted. Search ${easyEcomOrderNumber(row.orderNumber)} in EasyEcom. If it exists mark the queue row success; if not set status back to pending.`);
    }
    n++;
  }
  return n;
}

/** Cron sweep: recover stale rows, then process due `pending` rows. */
export async function processDue(limit = 10) {
  const summary = { recovered: 0, processed: 0, results: {} as Record<string, number> };
  const c = easyEcomConfig();
  if (!c.enabled) return { ...summary, disabled: true };

  summary.recovered = c.dryRun ? 0 : await recoverStale();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from(TABLE).select("*").eq("status", "pending").not("source_order_id", "is", null)
    .or(`next_retry_at.is.null,next_retry_at.lte.${nowIso}`)
    .order("created_at", { ascending: true }).limit(limit);
  if (error) throw error;

  for (const row of (data ?? []) as QueueRow[]) {
    const r = await processRow(deps(), row);
    summary.processed++;
    summary.results[r] = (summary.results[r] ?? 0) + 1;
  }
  return summary;
}

/** Daily check: paid orders that never reached the queue, and rows stuck too long. */
export async function reconcile(windowDays = 7) {
  const c = easyEcomConfig();
  if (!c.enabled) return { disabled: true };
  const since = new Date(Date.now() - windowDays * 86_400_000).toISOString();
  const grace = new Date(Date.now() - 15 * 60_000).toISOString();

  const { data: paid } = await supabase
    .from(ORDERS_TABLE).select("id,razorpay_order_id,country")
    .eq("payment_status", "paid").gte("paid_at", since).lte("paid_at", grace);
  const india = (paid ?? []).filter((o) => String(o.country ?? "").trim().toLowerCase() === "india");
  const { data: queued } = await supabase
    .from(TABLE).select("orderNumber").in("orderNumber", india.map((o) => o.razorpay_order_id));
  const have = new Set((queued ?? []).map((q) => q.orderNumber));
  const missing = india.filter((o) => !have.has(o.razorpay_order_id)).map((o) => o.razorpay_order_id);

  const stuckBefore = new Date(Date.now() - 30 * 60_000).toISOString();
  const { data: stuck } = await supabase
    .from(TABLE).select("orderNumber,status,error_message").in("status", ["pending", "failed"]).lte("updated_at", stuckBefore);

  if (missing.length || stuck?.length) {
    await sendAlert(
      `EasyEcom reconcile: ${missing.length} missing, ${stuck?.length ?? 0} stuck`,
      [`Paid India orders not in queue (last ${windowDays}d):`, ...missing,
       "", "Pending/failed rows older than 30 min:",
       ...(stuck ?? []).map((s) => `${s.orderNumber} [${s.status}] ${s.error_message ?? ""}`)].join("\n"),
    );
  }
  return { missing, stuck: stuck?.length ?? 0 };
}
