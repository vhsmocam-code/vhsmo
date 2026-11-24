/**
 * EasyEcom core: pure logic with no framework or database imports, so it can be
 * unit-tested directly with `node --test` (type stripping) and reused by the
 * Supabase-backed worker in ./index.ts.
 *
 * Safety principles baked in here:
 *  - The payload is built ONLY from the stored `orders` row (never client data).
 *  - An order is retried automatically ONLY when we can prove EasyEcom did not
 *    create it. Any ambiguous outcome is parked for a human - never resent blind.
 */

// ── Constants copied from the 206 orders EasyEcom already accepted ──────────

export const ORDER_TYPE = "retailorder";
export const MARKETPLACE_ID = 10;
export const PAYMENT_MODE_PREPAID = 5;
/** Cash on Delivery: WareIQ ships it as COD and the courier collects the total. */
export const PAYMENT_MODE_COD = 2;
const PAYMENT_MODES = new Set([PAYMENT_MODE_PREPAID, PAYMENT_MODE_COD]);
export const SHIPPING_METHOD = 1;

/** The only SKUs that exist in EasyEcom. Anything else is a permanent failure. */
export const ALLOWED_SKUS = new Set([
  "VHSMO Vol. 1_Baby Pink",
  "VHSMO Vol. 1_Cherry Red",
  "VHSMO Vol. 1_Cosmic Black",
]);

/** Delay before retry N (index = attempts already made). */
export const BACKOFF_MINUTES = [1, 5, 30, 120, 360];
export const MAX_ATTEMPTS = BACKOFF_MINUTES.length + 1;
/** A `processing` row whose lease is older than this is considered abandoned. */
export const LEASE_MINUTES = 5;

// ── Types ───────────────────────────────────────────────────────────────────

export interface Address {
  name: string;
  email: string;
  contact: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface EasyEcomItem {
  OrderItemId: string;
  Sku: string;
  productName: string;
  Quantity: number;
  Price: number;
  itemDiscount: number;
}

export interface QueueInsert {
  source_order_id: string;
  orderType: string;
  marketplaceId: number;
  orderNumber: string;
  paymentMode: number;
  shippingMethod: number;
  items: EasyEcomItem[];
  customer: { billing: Address; shipping: Address }[];
  request_payload: Record<string, unknown>;
  status: "pending";
  attempts: 0;
}

/** The subset of a Supabase `orders` row this module reads. */
export interface OrderRow {
  id: string;
  razorpay_order_id: string;
  customer_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  items: unknown;
  discount?: number | null;
  payment_status?: string;
  payment_method?: string | null;
  cod_fee?: number | string | null;
}

export interface QueueRow {
  id: number | string;
  source_order_id: string | null;
  orderNumber: string;
  paymentMode?: number | null;
  items: EasyEcomItem[];
  customer: { billing: Address; shipping: Address }[];
  request_payload: Record<string, unknown> | null;
  status: string;
  attempts: number | null;
  sent_at?: string | null;
  next_retry_at?: string | null;
  lease_expires_at?: string | null;
  easyecom_order_id?: string | null;
}

// ── Small helpers ───────────────────────────────────────────────────────────

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

const text = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

const round2 = (n: number) => Math.round(n * 100) / 100;

/** `order_ABC` → `VHSMO-ABC` (the convention EasyEcom already has). */
export function easyEcomOrderNumber(value: unknown): string {
  return text(value).replace(/^order_/i, "VHSMO-");
}

export function isAllowedSku(value: unknown): boolean {
  return ALLOWED_SKUS.has(text(value));
}

/** `2026-11-22T10:15:00+05:30` (IST), the format EasyEcom accepted. */
export function formatOrderDate(now: Date = new Date()): string {
  const india = new Date(now.getTime() + 330 * 60 * 1000);
  const iso = india.toISOString();
  return `${iso.slice(0, 10)}T${iso.slice(11, 19)}+05:30`;
}

// ── Building the queue row from a paid order ────────────────────────────────

export type BuildResult =
  | { ok: true; row: QueueInsert }
  | { ok: false; reason: string };

/**
 * Turns a paid `orders` row into the queue row. Never throws; returns a reason
 * instead so the caller can store a `failed` row the operator can see.
 */
export function buildQueueRow(
  order: OrderRow,
  opts: { sendDiscount?: boolean } = {},
): BuildResult {
  const orderNumber = text(order.razorpay_order_id);
  if (!orderNumber) return { ok: false, reason: "order has no razorpay_order_id" };

  const lines = Array.isArray(order.items) ? order.items : [];
  if (lines.length === 0) return { ok: false, reason: "order has no items" };

  // Spread the order-level coupon discount over lines in proportion to their
  // value; the last line absorbs rounding so the parts always sum exactly.
  const lineTotals = lines.map((l) => {
    const o = isObject(l) ? l : {};
    return Number(o.price) * Math.max(1, Math.floor(Number(o.quantity) || 1));
  });
  const grand = lineTotals.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
  const isCod = text(order.payment_method).toLowerCase() === "cod";
  const paymentMode = isCod ? PAYMENT_MODE_COD : PAYMENT_MODE_PREPAID;
  const codFee = isCod ? Math.max(0, Number(order.cod_fee) || 0) : 0;
  // A COD courier collects exactly what EasyEcom computes, so a COD order must
  // always carry its real discount (0 today: coupons are online-only).
  const discount = opts.sendDiscount || isCod ? Math.max(0, Number(order.discount) || 0) : 0;
  let allocated = 0;

  const items: EasyEcomItem[] = [];
  for (let i = 0; i < lines.length; i++) {
    const l = isObject(lines[i]) ? (lines[i] as Record<string, unknown>) : {};
    const name = text(l.name);
    const variant = text(l.variant);
    const quantity = Math.max(1, Math.floor(Number(l.quantity) || 1));
    const price = Number(l.price);
    if (!name || !variant) return { ok: false, reason: `item ${i + 1} has no name/variant` };
    if (!Number.isFinite(price) || price < 0) return { ok: false, reason: `item ${i + 1} has an invalid price` };

    let itemDiscount = 0;
    if (discount > 0 && grand > 0) {
      itemDiscount =
        i === lines.length - 1
          ? round2(discount - allocated)
          : round2((discount * (lineTotals[i] as number)) / grand);
      allocated += itemDiscount;
    }

    items.push({
      OrderItemId: `${orderNumber}-${i + 1}`,
      Sku: `${name}_${variant}`,
      productName: name,
      Quantity: quantity,
      Price: price,
      itemDiscount,
    });
  }

  const address: Address = {
    name: text(order.customer_name),
    email: text(order.email),
    contact: text(order.phone),
    addressLine1: text(order.address_line1),
    addressLine2: text(order.address_line2),
    city: text(order.city),
    state: text(order.state),
    country: text(order.country),
    postalCode: text(order.postal_code),
  };
  const customer = [{ billing: { ...address }, shipping: { ...address } }];

  return {
    ok: true,
    row: {
      source_order_id: order.id,
      orderType: ORDER_TYPE,
      marketplaceId: MARKETPLACE_ID,
      orderNumber,
      paymentMode,
      shippingMethod: SHIPPING_METHOD,
      items,
      customer,
      request_payload: {
        orderType: ORDER_TYPE,
        marketplaceId: MARKETPLACE_ID,
        orderNumber,
        paymentMode,
        shippingMethod: SHIPPING_METHOD,
        // The COD fee rides as a shipping charge so the collectable amount
        // equals the site total (item prices - discounts + fee).
        ...(codFee > 0 ? { shippingCost: codFee } : {}),
        items,
        customer,
      },
      status: "pending",
      attempts: 0,
    },
  };
}

// ── Validation (same rules as scripts/easyecom-sync.mjs) ────────────────────

function validateAddress(a: unknown, label: string): string[] {
  if (!isObject(a)) return [`${label} is missing`];
  const errors: string[] = [];
  for (const f of ["name", "addressLine1", "postalCode", "city", "state", "country", "contact", "email"]) {
    if (!text(a[f])) errors.push(`${label}.${f} is missing`);
  }
  if (text(a.country) && text(a.country).toLowerCase() !== "india") errors.push(`${label}.country must be India`);
  if (text(a.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(a.email))) errors.push(`${label}.email is invalid`);
  const digits = text(a.contact).replace(/[^0-9]/g, "");
  if (text(a.contact) && (digits.length < 7 || digits.length > 15)) errors.push(`${label}.contact is invalid`);
  if (text(a.postalCode) && !/^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/.test(text(a.postalCode))) errors.push(`${label}.postalCode is invalid`);
  return errors;
}

/** Returns the list of problems; an empty list means the row is safe to send. */
export function validateRow(
  row: Pick<QueueRow, "orderNumber" | "items" | "customer"> & Partial<Pick<QueueRow, "paymentMode">>,
): string[] {
  const errors: string[] = [];
  if (!text(row.orderNumber)) errors.push("orderNumber is missing");
  if (row.paymentMode != null && !PAYMENT_MODES.has(Number(row.paymentMode))) {
    errors.push(`paymentMode ${row.paymentMode} is not supported`);
  }
  if (!Array.isArray(row.items) || row.items.length === 0) {
    errors.push("items must be a nonempty array");
  } else {
    row.items.forEach((it, i) => {
      const p = `items[${i}]`;
      if (!isObject(it)) return void errors.push(`${p} is not an object`);
      if (!text(it.OrderItemId)) errors.push(`${p}.OrderItemId is missing`);
      if (!text(it.productName)) errors.push(`${p}.productName is missing`);
      if (!isAllowedSku(it.Sku)) errors.push(`${p}.Sku is not a confirmed EasyEcom SKU`);
      if (!Number.isInteger(it.Quantity) || it.Quantity <= 0) errors.push(`${p}.Quantity must be a positive integer`);
      if (typeof it.Price !== "number" || !Number.isFinite(it.Price) || it.Price < 0) errors.push(`${p}.Price must be a nonnegative number`);
      if (typeof it.itemDiscount !== "number" || !Number.isFinite(it.itemDiscount) || it.itemDiscount < 0) errors.push(`${p}.itemDiscount must be a nonnegative number`);
    });
  }
  if (!Array.isArray(row.customer) || row.customer.length === 0) {
    errors.push("customer must be a nonempty array");
  } else {
    row.customer.forEach((c, i) => {
      errors.push(...validateAddress(c?.billing, `customer[${i}].billing`));
      errors.push(...validateAddress(c?.shipping, `customer[${i}].shipping`));
    });
  }
  return errors;
}

/** paymentMode stored on the row (or its payload); prepaid for old rows. */
export function rowPaymentMode(row: Pick<QueueRow, "paymentMode" | "request_payload">): number {
  const fromRow = Number(row.paymentMode);
  if (PAYMENT_MODES.has(fromRow)) return fromRow;
  const fromPayload = Number(row.request_payload?.paymentMode);
  if (PAYMENT_MODES.has(fromPayload)) return fromPayload;
  return PAYMENT_MODE_PREPAID;
}

/** COD fee carried in the stored payload (0 for prepaid). */
export function rowShippingCost(row: Pick<QueueRow, "request_payload">): number {
  const n = Number(row.request_payload?.shippingCost);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** The exact body POSTed to EasyEcom (outbound order number + fresh date). */
export function buildOutboundPayload(row: QueueRow, now: Date = new Date()) {
  const shippingCost = rowShippingCost(row);
  return {
    orderType: ORDER_TYPE,
    marketplaceId: MARKETPLACE_ID,
    orderNumber: easyEcomOrderNumber(row.orderNumber),
    paymentMode: rowPaymentMode(row),
    shippingMethod: SHIPPING_METHOD,
    ...(shippingCost > 0 ? { shippingCost } : {}),
    orderDate: formatOrderDate(now),
    items: row.items.map((it) => ({ ...it, OrderItemId: easyEcomOrderNumber(it.OrderItemId) })),
    customer: row.customer,
  };
}

// ── Talking to EasyEcom ─────────────────────────────────────────────────────

export interface ParsedResponse {
  ok: boolean;
  orderId: string | null;
  apiSuccess: boolean;
}

const asId = (v: unknown): string | null => {
  const s = typeof v === "number" && Number.isInteger(v) ? String(v) : text(v);
  return /^\d+$/.test(s) && s !== "0" ? s : null;
};

export function parseEasyEcomResponse(body: unknown, httpStatus: number): ParsedResponse {
  const b = isObject(body) ? body : null;
  const data = b && isObject(b.data) ? b.data : null;
  const orderId = asId(data?.OrderID);
  const msgOk = [data?.Message, b?.message]
    .filter((v): v is string => typeof v === "string")
    .some((v) => /success|created successfully/i.test(v));
  const apiSuccess = b?.code === 200 && data?.Status === 200 && msgOk;
  return {
    ok: httpStatus >= 200 && httpStatus < 300 && apiSuccess && Boolean(orderId),
    orderId,
    apiSuccess,
  };
}

export type PostResult =
  | { kind: "response"; status: number; body: unknown; raw: string; malformed: boolean }
  | { kind: "network-error"; message: string };

export interface EasyEcomCreds {
  endpoint: string;
  apiKey: string;
  jwt: string;
}

export function safeError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.replace(/(authorization|x-api-key|password|jwt|token)\s*[:=]\s*[^\s,;]+/gi, "$1=[redacted]").slice(0, 500);
}

/** One POST, no retry. A thrown fetch (timeout etc.) is reported, never retried. */
export async function postOrder(
  creds: EasyEcomCreds,
  payload: unknown,
  { fetchImpl = fetch, timeoutMs = 30_000 }: { fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<PostResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(creds.endpoint, {
      method: "POST",
      headers: {
        "x-api-key": creds.apiKey,
        Authorization: `Bearer ${creds.jwt}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const raw = await res.text();
    let body: unknown = null;
    let malformed = false;
    try {
      body = raw ? JSON.parse(raw) : null;
    } catch {
      malformed = true;
    }
    return { kind: "response", status: res.status, body, raw, malformed };
  } catch (error) {
    return { kind: "network-error", message: safeError(error) };
  } finally {
    clearTimeout(timer);
  }
}

// ── Classifying the outcome ─────────────────────────────────────────────────

export type Outcome =
  | { type: "success"; orderId: string }
  | { type: "retry"; reason: string }        // provably NOT created
  | { type: "permanent"; reason: string }    // EasyEcom definitively rejected it
  | { type: "ambiguous"; reason: string };   // might exist - a human must check

export function classify(result: PostResult): Outcome {
  if (result.kind === "network-error") {
    return {
      type: "ambiguous",
      reason: `Request outcome uncertain: ${result.message}. It may have reached EasyEcom - verify there before retrying.`,
    };
  }
  const parsed = parseEasyEcomResponse(result.body, result.status);
  if (parsed.ok && parsed.orderId) return { type: "success", orderId: parsed.orderId };

  // 429 / 401 are returned before any order logic runs - safe to retry.
  if (result.status === 429) return { type: "retry", reason: "EasyEcom rate limited the request (HTTP 429)" };
  if (result.status === 401 || result.status === 403) return { type: "retry", reason: `EasyEcom rejected credentials (HTTP ${result.status})` };

  if (result.malformed || result.body == null) {
    return { type: "ambiguous", reason: `EasyEcom returned an empty/malformed response (HTTP ${result.status}) - verify there before retrying.` };
  }
  if (parsed.apiSuccess) {
    return { type: "ambiguous", reason: "EasyEcom reported success without a valid OrderID - verify there before retrying." };
  }
  if (result.status >= 500) {
    return { type: "ambiguous", reason: `EasyEcom server error (HTTP ${result.status}) - verify there before retrying.` };
  }
  const b = isObject(result.body) ? result.body : {};
  const detail = text(b.message) || text(isObject(b.data) ? b.data.Message : "") || `HTTP ${result.status}`;
  return { type: "permanent", reason: `EasyEcom rejected the order: ${detail}`.slice(0, 500) };
}

export function nextRetryAt(attemptsMade: number, now: Date = new Date()): string {
  const minutes = BACKOFF_MINUTES[Math.min(Math.max(attemptsMade - 1, 0), BACKOFF_MINUTES.length - 1)] as number;
  return new Date(now.getTime() + minutes * 60_000).toISOString();
}

// ── The worker: one queue row, fully dependency-injected ────────────────────

export interface Store {
  /** pending(+due) → processing with a lease; null if another worker won. */
  claim(row: QueueRow, leaseUntil: string): Promise<QueueRow | null>;
  /** Persist "request is about to be sent" - must succeed before we POST. */
  markSent(id: QueueRow["id"], at: string): Promise<boolean>;
  update(id: QueueRow["id"], values: Record<string, unknown>, expectedStatus: string): Promise<void>;
}

export interface WorkerDeps {
  store: Store;
  /** Returns creds, or null when not configured (row is left pending). */
  getCreds: () => Promise<EasyEcomCreds | null>;
  refreshCreds?: () => Promise<EasyEcomCreds | null>;
  post: (creds: EasyEcomCreds, payload: unknown) => Promise<PostResult>;
  alert: (subject: string, body: string) => Promise<void>;
  dryRun: boolean;
  now?: () => Date;
}

export type ProcessResult =
  | "success" | "retry" | "failed" | "ambiguous" | "dry-run" | "skipped" | "not-configured";

export async function processRow(deps: WorkerDeps, input: QueueRow): Promise<ProcessResult> {
  const now = deps.now ?? (() => new Date());
  const { store } = deps;

  const errors = validateRow(input);
  if (errors.length) {
    if (!deps.dryRun) {
      await store.update(input.id, { status: "failed", error_message: errors.join("; "), processed_at: now().toISOString() }, input.status);
      await deps.alert(`EasyEcom: order ${input.orderNumber} failed validation`, errors.join("\n"));
    }
    return "failed";
  }
  if (deps.dryRun) return "dry-run"; // validated only; nothing sent, nothing written

  let creds = await deps.getCreds();
  if (!creds) return "not-configured";

  const leaseUntil = new Date(now().getTime() + LEASE_MINUTES * 60_000).toISOString();
  const row = await store.claim(input, leaseUntil);
  if (!row) return "skipped"; // another worker owns it
  const attempts = Number(row.attempts ?? 0); // claim already incremented it

  // Past this point we may be creating a real order. Record the intent first.
  if (!(await store.markSent(row.id, now().toISOString()))) {
    await store.update(row.id, { status: "pending", next_retry_at: nextRetryAt(attempts, now()), error_message: "could not record send intent; not sent" }, "processing");
    return "retry";
  }

  const payload = buildOutboundPayload(row, now());
  let result = await deps.post(creds, payload);
  let outcome = classify(result);

  // Expired JWT: refresh once and resend (a 401 means no order was created).
  if (outcome.type === "retry" && deps.refreshCreds && /credentials/.test(outcome.reason)) {
    const fresh = await deps.refreshCreds();
    if (fresh) {
      creds = fresh;
      result = await deps.post(creds, payload);
      outcome = classify(result);
    }
  }

  const stamp = now().toISOString();
  // Keep EasyEcom's raw reply on the row for every outcome - it is the audit trail.
  const response_payload =
    result.kind === "response" ? (result.malformed ? result.raw || null : result.body) : null;
  switch (outcome.type) {
    case "success":
      await store.update(row.id, { status: "success", response_payload, easyecom_order_id: outcome.orderId, error_message: null, processed_at: stamp, lease_expires_at: null }, "processing");
      return "success";
    case "retry":
      if (attempts >= MAX_ATTEMPTS) {
        await store.update(row.id, { status: "failed", response_payload, error_message: `${outcome.reason}; gave up after ${attempts} attempts`, processed_at: stamp, lease_expires_at: null }, "processing");
        await deps.alert(`EasyEcom: order ${row.orderNumber} gave up`, outcome.reason);
        return "failed";
      }
      // Nothing was created, so the send marker is cleared and it goes back to pending.
      await store.update(row.id, { status: "pending", response_payload, sent_at: null, next_retry_at: nextRetryAt(attempts, now()), error_message: outcome.reason, lease_expires_at: null }, "processing");
      return "retry";
    case "permanent":
      await store.update(row.id, { status: "failed", response_payload, error_message: outcome.reason, processed_at: stamp, lease_expires_at: null }, "processing");
      await deps.alert(`EasyEcom: order ${row.orderNumber} rejected`, outcome.reason);
      return "failed";
    case "ambiguous":
      await store.update(row.id, { status: "failed", response_payload, error_message: outcome.reason, processed_at: stamp, lease_expires_at: null }, "processing");
      await deps.alert(`EasyEcom: order ${row.orderNumber} needs a manual check`, `${outcome.reason}\n\nOpen EasyEcom and search ${easyEcomOrderNumber(row.orderNumber)}. If it exists, mark the queue row success; if not, set status back to pending.`);
      return "ambiguous";
  }
}
