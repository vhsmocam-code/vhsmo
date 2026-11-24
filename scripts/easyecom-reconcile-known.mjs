#!/usr/bin/env node

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { parseEasyEcomResponse, reconciliationUpdate } from "./easyecom-sync.mjs";

const TABLE = "easyecom_order_queue";
const KNOWN_ORDERS = new Map([
  ["order_THk58ch0pfaSZ1", "659835175"],
  ["order_TIARE9VNWei9vU", "659835189"],
  ["order_TIBiFXPUqwkaNv", "659835200"],
  ["order_TIXcuUqh2G4S6o", "659835206"],
  ["order_TIYH7ZNkU5tCn1", "659835209"],
  ["order_TIYz0sxoCG534S", "659843492"],
  ["order_THjiDrAACl2kKa", "659843496"],
  ["order_THjiVwcC3r5LHz", "659843497"],
  ["order_THjiEuPBGcPLia", "659843498"],
  ["order_THjirt4d7OoxOu", "659843508"],
]);

function required(name, value) {
  if (!value?.trim()) throw new Error(`Missing required environment variable: ${name}`);
  return value.trim();
}

function parseArgs(argv) {
  const result = { execute: false };
  for (const arg of argv) {
    if (arg === "--execute") result.execute = true;
    else if (arg === "--dry-run") result.execute = false;
    else if (arg.startsWith("--order-number=")) result.orderNumber = arg.slice(15);
    else if (arg === "--help" || arg === "-h") {
      console.log("Usage: node scripts/easyecom-reconcile-known.mjs [--dry-run|--execute] [--order-number=ORDER]");
      process.exit(0);
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  return result;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const url = required("SUPABASE_URL", process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
  const client = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const entries = args.orderNumber ? [[args.orderNumber, KNOWN_ORDERS.get(args.orderNumber)]] : [...KNOWN_ORDERS.entries()];

  for (const [orderNumber, expectedOrderId] of entries) {
    if (!expectedOrderId) {
      console.log(`order=${JSON.stringify(orderNumber)} outcome=not_in_known_reconciliation_set`);
      continue;
    }
    const { data: rows, error } = await client.from(TABLE).select("id,orderNumber,status,response_payload,easyecom_order_id").eq("orderNumber", orderNumber);
    if (error) throw error;
    if (rows.length !== 1) {
      console.log(`order=${JSON.stringify(orderNumber)} outcome=${rows.length === 0 ? "not_found" : "ambiguous_queue_rows"}`);
      continue;
    }
    const row = rows[0];
    const confirmed = parseEasyEcomResponse(row.response_payload, 200);
    if (row.status === "success" && confirmed.ok && confirmed.orderId === expectedOrderId) {
      console.log(`order=${JSON.stringify(orderNumber)} outcome=already_reconciled easyecom_order_id=${expectedOrderId}`);
      continue;
    }
    const update = reconciliationUpdate(row, expectedOrderId);
    if (!update) {
      console.log(`order=${JSON.stringify(orderNumber)} outcome=payload_not_confirmed`);
      continue;
    }
    if (!args.execute) {
      console.log(`order=${JSON.stringify(orderNumber)} outcome=would_reconcile easyecom_order_id=${expectedOrderId}`);
      continue;
    }
    const { error: updateError } = await client.from(TABLE)
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq("id", row.id)
      .eq("status", row.status);
    if (updateError) throw updateError;
    console.log(`order=${JSON.stringify(orderNumber)} outcome=reconciled easyecom_order_id=${expectedOrderId}`);
  }
}

if (process.argv[1]?.endsWith("scripts/easyecom-reconcile-known.mjs")) {
  main().catch((error) => {
    console.error(`EasyEcom reconciliation stopped: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}

