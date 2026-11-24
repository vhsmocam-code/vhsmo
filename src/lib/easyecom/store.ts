import { supabase } from "@/lib/supabase";
import type { QueueRow, Store } from "./core";

export const TABLE = "easyecom_order_queue";

export const supabaseStore: Store = {
  async claim(row, leaseUntil) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({
        status: "processing",
        attempts: Number(row.attempts ?? 0) + 1,
        lease_expires_at: leaseUntil,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id)
      .eq("status", "pending")
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return (data as QueueRow | null) ?? null;
  },

  async markSent(id, at) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ sent_at: at, updated_at: at })
      .eq("id", id)
      .eq("status", "processing")
      .select("id");
    return !error && Boolean(data?.length);
  },

  async update(id, values, expectedStatus) {
    const { error } = await supabase
      .from(TABLE)
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", expectedStatus);
    if (error) throw error;
  },
};
