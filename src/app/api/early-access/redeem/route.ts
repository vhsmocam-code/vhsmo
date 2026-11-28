import {
  createRateLimiter,
  decideRedemption,
  EARLY_ACCESS_FEATURES,
  normalizeCode,
  normalizeDeviceId,
  type Decision,
  type EarlyAccessRow,
} from "@/lib/early-access/core";
import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

const allow = createRateLimiter(10, 10 * 60_000);

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

async function findByCode(code: string): Promise<EarlyAccessRow | null> {
  const { data, error } = await supabase
    .from("early_access_customers")
    .select("id, locked, device_id")
    .eq("code", code)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Ties the code to this device only if nobody has claimed it in the meantime. */
async function claim(id: string, deviceId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("early_access_customers")
    .update({ device_id: deviceId, redeemed_at: new Date().toISOString() })
    .eq("id", id)
    .is("device_id", null)
    .eq("locked", false)
    .select("id");
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

/**
 * The app calls this to redeem a code and again every few days to re-check it.
 * 200 = a definitive answer (`valid` true/false). Anything else means "couldn't
 * check", and the app must not take access away because of it.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allow(ip)) {
    return json({ valid: false, reason: "rate_limited" }, 429);
  }

  let body: { code?: unknown; deviceId?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ valid: false, reason: "bad_request" }, 400);
  }

  const code = normalizeCode(body.code);
  const deviceId = normalizeDeviceId(body.deviceId);
  if (!code || !deviceId) {
    return json({ valid: false, reason: "bad_request" }, 400);
  }

  try {
    let decision: Decision = decideRedemption(await findByCode(code), deviceId);

    if (decision.kind === "claim" && !(await claim(decision.id, deviceId))) {
      // Lost a race with another phone (or it was just locked): decide again.
      decision = decideRedemption(await findByCode(code), deviceId);
      if (decision.kind === "claim") {
        return json({ valid: false, reason: "server_error" }, 500);
      }
    }

    if (decision.kind === "rejected") {
      return json({ valid: false, reason: decision.reason });
    }
    return json({ valid: true, features: EARLY_ACCESS_FEATURES });
  } catch (error) {
    console.error("early-access redeem failed:", error);
    return json({ valid: false, reason: "server_error" }, 500);
  }
}
