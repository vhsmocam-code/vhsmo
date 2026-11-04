#!/usr/bin/env node

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "node:url";

const TABLE = "easyecom_order_queue";
const ALLOWED_SKUS = new Set([
  "VHSMO Vol. 1_Baby Pink",
  "VHSMO Vol. 1_Cherry Red",
  "VHSMO Vol. 1_Cosmic Black",
]);

function parseArgs(argv) {
  const result = {};
  for (const arg of argv) {
    if (arg === "--execute") result.execute = true;
    else if (arg === "--dry-run") result.execute = false;
    else if (arg.startsWith("--limit=")) result.limit = arg.slice(8);
    else if (arg.startsWith("--order-number=")) result.orderNumber = arg.slice(15);
    else if (arg.startsWith("--sku=")) result.sku = arg.slice(6);
    else if (arg.startsWith("--batch-size=")) result.batchSize = arg.slice(13);
    else if (arg.startsWith("--max-retries=")) result.maxRetries = arg.slice(14);
    else if (arg.startsWith("--timeout-ms=")) result.timeoutMs = arg.slice(13);
    else if (arg === "--help" || arg === "-h") {
      console.log(`Usage: npm run easyecom:sync -- [--dry-run|--execute] [--limit=N] [--order-number=ORDER] [--sku=SKU]`);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return result;
}

function positiveInt(value, fallback) {
  if (value == null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`Expected a positive integer, received: ${value}`);
  }
  return parsed;
}

function required(name, value) {
  if (!value?.trim()) throw new Error(`Missing required environment variable: ${name}`);
  return value.trim();
}

function getConfig(dryRun) {
  const url = required(
    "SUPABASE_URL",
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
  const serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
  const apiKey = dryRun ? (process.env.EASYECOM_API_KEY || "") : required("EASYECOM_API_KEY", process.env.EASYECOM_API_KEY);
  const jwt = dryRun ? (process.env.EASYECOM_JWT_TOKEN || "") : required("EASYECOM_JWT_TOKEN", process.env.EASYECOM_JWT_TOKEN);
  const endpoint = process.env.EASYECOM_CREATE_ORDER_URL ||
    "https://api.easyecom.io/webhook/v2/createOrder";
  if (!endpoint.startsWith("https://")) throw new Error("EASYECOM_CREATE_ORDER_URL must use HTTPS");
  return { url, serviceRoleKey, apiKey, jwt, endpoint };
}

function makeClient(config) {
  return createClient(config.url, config.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isAllowedSku(value) {
  return ALLOWED_SKUS.has(text(value));
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(value));
}

function validPhone(value) {
  const digits = text(value).replace(/[^0-9]/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

function validateAddress(address, label) {
  const errors = [];
  if (!isObject(address)) return [`${label} is missing`];
  for (const field of ["name", "addressLine1", "postalCode", "city", "state", "country", "contact", "email"]) {
    if (!text(address[field])) errors.push(`${label}.${field} is missing`);
  }
  if (text(address.country).toLowerCase() !== "india") errors.push(`${label}.country must be India`);
  if (text(address.email) && !validEmail(address.email)) errors.push(`${label}.email is invalid`);
  if (text(address.contact) && !validPhone(address.contact)) errors.push(`${label}.contact is invalid`);
  if (text(address.postalCode) && !/^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/.test(text(address.postalCode))) {
    errors.push(`${label}.postalCode is invalid`);
  }
  return errors;
}

function validateOrder(row, seenOrderNumbers) {
  const errors = [];
  const orderNumber = text(row.orderNumber);
  if (!orderNumber) errors.push("orderNumber is missing");
  if (seenOrderNumbers.has(orderNumber)) errors.push("orderNumber is duplicated in this batch");

  if (!Array.isArray(row.items) || row.items.length === 0) {
    errors.push("items must be a nonempty array");
  } else {
    row.items.forEach((item, index) => {
      const prefix = `items[${index}]`;
      if (!isObject(item)) {
        errors.push(`${prefix} is not an object`);
        return;
      }
      for (const field of ["OrderItemId", "Sku", "productName", "Quantity", "Price", "itemDiscount"]) {
        if (item[field] === undefined || item[field] === null || item[field] === "") errors.push(`${prefix}.${field} is missing`);
      }
      if (!Number.isInteger(item.Quantity) || item.Quantity <= 0) errors.push(`${prefix}.Quantity must be a positive integer`);
      if (typeof item.Price !== "number" || !Number.isFinite(item.Price) || item.Price < 0) errors.push(`${prefix}.Price must be a nonnegative number`);
      if (typeof item.itemDiscount !== "number" || !Number.isFinite(item.itemDiscount) || item.itemDiscount < 0) errors.push(`${prefix}.itemDiscount must be a nonnegative number`);
      if (!isAllowedSku(item.Sku)) errors.push(`${prefix}.Sku is not a confirmed EasyEcom SKU`);
    });
  }

  if (!Array.isArray(row.customer) || row.customer.length === 0) {
    errors.push("customer must be a nonempty array");
  } else {
    for (const [index, customer] of row.customer.entries()) {
      errors.push(...validateAddress(customer?.billing, `customer[${index}].billing`));
      errors.push(...validateAddress(customer?.shipping, `customer[${index}].shipping`));
    }
  }

  const payload = row.request_payload ?? {
    orderType: row.orderType,
    marketplaceId: row.marketplaceId,
    orderNumber: row.orderNumber,
    paymentMode: row.paymentMode,
    shippingMethod: row.shippingMethod,
    items: row.items,
    customer: row.customer,
  };
  if (!isObject(payload)) errors.push("request_payload must be a JSON object");
  else {
    if (text(payload.orderNumber) !== orderNumber) errors.push("request_payload.orderNumber does not match orderNumber");
    if (JSON.stringify(payload.items) !== JSON.stringify(row.items)) errors.push("request_payload.items does not match items");
    if (JSON.stringify(payload.customer) !== JSON.stringify(row.customer)) errors.push("request_payload.customer does not match customer");
  }

  return { errors, payload };
}

function safeError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/(authorization|x-api-key|password|jwt|token)\s*[:=]\s*[^\s,;]+/gi, "$1=[redacted]").slice(0, 500);
}

function logOutcome(row, outcome, details = {}) {
  const parts = [
    `order=${JSON.stringify(text(row.orderNumber) || "<missing>")}`,
    `queue_id=${row.id}`,
    `outcome=${outcome}`,
  ];
  if (details.httpStatus != null) parts.push(`http_status=${details.httpStatus}`);
  if (details.easyecomOrderId) parts.push(`easyecom_order_id=${JSON.stringify(details.easyecomOrderId)}`);
  if (details.error) parts.push(`error=${JSON.stringify(safeError(details.error))}`);
  console.log(parts.join(" "));
}

function normalizeEasyEcomId(value) {
  const valueAsText = typeof value === "number" && Number.isInteger(value)
    ? String(value)
    : text(value);
  return /^\d+$/.test(valueAsText) && valueAsText !== "0" ? valueAsText : null;
}

function parseEasyEcomResponse(body, httpStatus) {
  const data = isObject(body?.data) ? body.data : null;
  const orderId = normalizeEasyEcomId(data?.OrderID);
  const suborderId = normalizeEasyEcomId(data?.SuborderID);
  const invoiceId = normalizeEasyEcomId(data?.InvoiceID);
  const successMessage = [data?.Message, body?.message]
    .filter((value) => typeof value === "string")
    .some((value) => /success|created successfully/i.test(value));
  const apiSuccess = body?.code === 200 && data?.Status === 200 && successMessage;
  return {
    ok: Number.isInteger(httpStatus) && httpStatus >= 200 && httpStatus < 300 && apiSuccess && Boolean(orderId),
    orderId,
    suborderId,
    invoiceId,
    apiSuccess: Boolean(apiSuccess),
  };
}

async function postOrder(config, payload, { fetchImpl = fetch, timeoutMs = 30_000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(config.endpoint, {
      method: "POST",
      headers: {
        "x-api-key": config.apiKey,
        Authorization: `Bearer ${config.jwt}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const raw = await response.text();
    let body = null;
    let malformed = false;
    try { body = raw ? JSON.parse(raw) : null; } catch { malformed = true; }
    return { response, body, raw, malformed };
  } catch (error) {
    return { ambiguousError: `Request outcome is uncertain: ${safeError(error)}. The request may have reached EasyEcom; manual reconciliation is required and automatic retry is disabled.` };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchPending(client, { orderNumberFilter = null, limit = null } = {}) {
  let query = client.from(TABLE).select("*").eq("status", "pending").order("created_at", { ascending: true });
  if (orderNumberFilter) query = query.eq("orderNumber", orderNumberFilter);
  if (limit != null) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

async function claim(client, row) {
  const { data, error } = await client
    .from(TABLE)
    .update({ status: "processing", attempts: Number(row.attempts ?? 0) + 1, updated_at: new Date().toISOString() })
    .eq("id", row.id)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function updateRow(client, id, values, expectedStatus = null) {
  let query = client.from(TABLE).update({ ...values, updated_at: new Date().toISOString() }).eq("id", id);
  if (expectedStatus) query = query.eq("status", expectedStatus);
  const { error } = await query;
  if (error) throw error;
}

function reconciliationUpdate(row, expectedOrderId, now = new Date().toISOString()) {
  const parsed = parseEasyEcomResponse(row.response_payload, 200);
  if (row.status === "success" || parsed.orderId !== expectedOrderId || !parsed.ok) return null;
  return {
    status: "success",
    easyecom_order_id: expectedOrderId,
    error_message: null,
    processed_at: now,
  };
}

export { isAllowedSku, parseEasyEcomResponse, postOrder, reconciliationUpdate, shouldCreateOrder };

function shouldCreateOrder({ dryRun }) {
  return !dryRun;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dryRun = !args.execute;
  const batchSize = positiveInt(args.batchSize ?? process.env.EASYECOM_BATCH_SIZE, 10);
  const timeoutMs = positiveInt(args.timeoutMs ?? process.env.EASYECOM_REQUEST_TIMEOUT_MS, 30_000);
  const limit = args.limit == null ? null : positiveInt(args.limit, 0);
  const orderNumberFilter = args.orderNumber?.trim() || null;
  const skuFilter = args.sku?.trim() || null;
  if (skuFilter && !isAllowedSku(skuFilter)) throw new Error(`--sku must be one of the confirmed EasyEcom SKUs`);
  const config = getConfig(dryRun);
  const client = makeClient(config);
  const fetchedRows = await fetchPending(client, { orderNumberFilter, limit: skuFilter ? null : limit });
  const rows = skuFilter
    ? fetchedRows.filter((row) => Array.isArray(row.items) && row.items.length > 0 && row.items.every((item) => text(item?.Sku) === skuFilter)).slice(0, limit ?? undefined)
    : fetchedRows;
  const seen = new Set();
  const summary = { fetched: rows.length, validated: 0, succeeded: 0, failed: 0, skipped: 0, remaining: 0 };

  console.log(`EasyEcom sync ${dryRun ? "dry-run" : "EXECUTE"}: fetched ${rows.length} pending order(s)`);
  if (!dryRun) console.warn("WARNING: execute mode will create real EasyEcom orders. Only continue if this batch has been reviewed.");

  for (let batchStart = 0; batchStart < rows.length; batchStart += batchSize) {
    const batch = rows.slice(batchStart, batchStart + batchSize);
    for (const row of batch) {
    const validation = validateOrder(row, seen);
    if (validation.errors.length === 0) seen.add(text(row.orderNumber));
    if (validation.errors.length) {
      summary.skipped += 1;
      logOutcome(row, "skipped", { error: validation.errors.join("; ") });
      if (!dryRun) await updateRow(client, row.id, { status: "skipped", error_message: validation.errors.join("; "), processed_at: new Date().toISOString() }, "pending");
      continue;
    }
    summary.validated += 1;
    if (dryRun) {
      logOutcome(row, "valid");
      continue;
    }

    const claimed = await claim(client, row);
    if (!claimed) {
      summary.skipped += 1;
      logOutcome(row, "skipped", { error: "Row was claimed by another worker" });
      continue;
    }

    const result = await postOrder(config, validation.payload, { timeoutMs });
    if (result?.ambiguousError) {
      summary.failed += 1;
      await updateRow(client, row.id, { status: "failed", error_message: result.ambiguousError, processed_at: null }, "processing");
      logOutcome(row, "failed", { error: result.ambiguousError });
      continue;
    }
    const responsePayload = result.malformed ? (result.raw || null) : result.body;
    const parsed = parseEasyEcomResponse(result.body, result.response.status);
    if (parsed.ok) {
      summary.succeeded += 1;
      await updateRow(client, row.id, { status: "success", response_payload: responsePayload, easyecom_order_id: parsed.orderId, error_message: null, processed_at: new Date().toISOString() }, "processing");
      logOutcome(row, "success", { httpStatus: result.response.status, easyecomOrderId: parsed.orderId });
    } else {
      summary.failed += 1;
      const reason = result.malformed || responsePayload == null
        ? "EasyEcom returned an empty or malformed response; manual reconciliation required and automatic retry is disabled"
        : !result.response.ok
          ? `EasyEcom returned HTTP ${result.response.status}; automatic retry is disabled`
          : parsed.apiSuccess
            ? "EasyEcom success response did not contain a valid OrderID; manual reconciliation required and automatic retry is disabled"
            : "EasyEcom returned an API-level failure; automatic retry is disabled";
      await updateRow(client, row.id, { status: "failed", response_payload: responsePayload, error_message: reason, processed_at: new Date().toISOString() }, "processing");
      logOutcome(row, "failed", { httpStatus: result.response.status, error: reason });
    }
    }
  }

  const { count, error } = await client.from(TABLE).select("id", { count: "exact", head: true }).eq("status", "pending");
  if (!error) summary.remaining = count ?? 0;
  console.log("\nEasyEcom batch sync completed");
  console.log(`Fetched:       ${summary.fetched}`);
  console.log(`Validated:     ${summary.validated}`);
  console.log(`Succeeded:     ${summary.succeeded}`);
  console.log(`Failed:        ${summary.failed}`);
  console.log(`Skipped:        ${summary.skipped}`);
  console.log(`Still pending:  ${summary.remaining}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`EasyEcom sync stopped: ${safeError(error)}`);
    process.exitCode = 1;
  });
}
