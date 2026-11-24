import test from "node:test";
import assert from "node:assert/strict";
import {
  buildQueueRow, buildOutboundPayload, validateRow, classify, nextRetryAt, processRow,
  parseEasyEcomResponse, easyEcomOrderNumber, MAX_ATTEMPTS,
} from "../src/lib/easyecom/core.ts";

const order = (over = {}) => ({
  id: "625657b2-ac30-4367-a9d9-eae420babd41",
  razorpay_order_id: "order_THk58ch0pfaSZ1",
  customer_name: "Test User", email: "t@example.com", phone: "9999999999",
  address_line1: "1 Street", address_line2: null, city: "Vinukonda", state: "Andhra Pradesh",
  country: "India", postal_code: "522647", discount: 0,
  items: [{ productId: "x", name: "VHSMO Vol. 1", variant: "Cherry Red", quantity: 1, price: 4999, total: 4999 }],
  ...over,
});
const okBody = { code: 200, data: { Status: 200, Message: "Success", OrderID: "659843492" }, message: "created successfully" };
const resp = (status, body, malformed = false) => ({ kind: "response", status, body, raw: JSON.stringify(body), malformed });

test("queue row matches the shape of the 206 orders EasyEcom already accepted", () => {
  const r = buildQueueRow(order());
  assert.ok(r.ok);
  assert.equal(r.row.orderNumber, "order_THk58ch0pfaSZ1");
  assert.deepEqual(r.row.items, [{ OrderItemId: "order_THk58ch0pfaSZ1-1", Sku: "VHSMO Vol. 1_Cherry Red", productName: "VHSMO Vol. 1", Quantity: 1, Price: 4999, itemDiscount: 0 }]);
  assert.equal(r.row.paymentMode, 5); assert.equal(r.row.marketplaceId, 10);
  assert.equal(r.row.orderType, "retailorder"); assert.equal(r.row.shippingMethod, 1);
  assert.deepEqual(r.row.customer[0].billing, r.row.customer[0].shipping);
  assert.deepEqual(validateRow(r.row), []);
});

test("trims stray whitespace in product names (products table has a trailing newline)", () => {
  const r = buildQueueRow(order({ items: [{ name: "VHSMO Vol. 1\n", variant: " Cherry Red ", quantity: 1, price: 4999 }] }));
  assert.equal(r.row.items[0].Sku, "VHSMO Vol. 1_Cherry Red");
});

test("discount is only sent when enabled, and sums exactly across lines", () => {
  const two = { discount: 1000, items: [
    { name: "VHSMO Vol. 1", variant: "Cherry Red", quantity: 1, price: 5999 },
    { name: "VHSMO Vol. 1", variant: "Baby Pink", quantity: 1, price: 5999 } ] };
  assert.equal(buildQueueRow(order(two)).row.items[0].itemDiscount, 0);
  const d = buildQueueRow(order({ ...two, discount: 1000.01 }), { sendDiscount: true }).row.items;
  assert.equal(Math.round((d[0].itemDiscount + d[1].itemDiscount) * 100) / 100, 1000.01);
});

test("rejects unknown SKU, non-India, bad phone, empty items", () => {
  assert.ok(validateRow(buildQueueRow(order({ items: [{ name: "VHSMO Vol. 1", variant: "Green", quantity: 1, price: 1 }] })).row).some((e) => /Sku/.test(e)));
  assert.ok(validateRow(buildQueueRow(order({ country: "US" })).row).some((e) => /India/.test(e)));
  assert.ok(validateRow(buildQueueRow(order({ phone: "12" })).row).some((e) => /contact/.test(e)));
  assert.equal(buildQueueRow(order({ items: [] })).ok, false);
  assert.equal(buildQueueRow(order({ razorpay_order_id: "" })).ok, false);
});

test("outbound payload renames to VHSMO-, adds an IST date and keeps items", () => {
  const row = buildQueueRow(order()).row;
  const p = buildOutboundPayload({ ...row, id: 1, status: "processing", attempts: 1 }, new Date("2026-11-22T10:00:00Z"));
  assert.equal(p.orderNumber, "VHSMO-THk58ch0pfaSZ1");
  assert.equal(p.items[0].OrderItemId, "VHSMO-THk58ch0pfaSZ1-1");
  assert.equal(p.orderDate, "2026-11-22T15:30:00+05:30");
});

test("classifies outcomes: only provably-not-created cases are retryable", () => {
  assert.equal(classify(resp(200, okBody)).type, "success");
  assert.equal(classify(resp(429, { message: "slow down" })).type, "retry");
  assert.equal(classify(resp(401, { message: "expired" })).type, "retry");
  assert.equal(classify(resp(400, { code: 400, message: "bad pincode" })).type, "permanent");
  assert.equal(classify(resp(500, { message: "boom" })).type, "ambiguous");
  assert.equal(classify(resp(200, null, true)).type, "ambiguous");
  assert.equal(classify({ kind: "network-error", message: "timeout" }).type, "ambiguous");
  assert.equal(classify(resp(200, { code: 200, data: { Status: 200, Message: "Success" } })).type, "ambiguous");
});

test("backoff grows and is capped", () => {
  const t = new Date("2026-01-01T00:00:00Z");
  const mins = [1, 2, 3, 4, 5, 9].map((n) => (new Date(nextRetryAt(n, t)) - t) / 60000);
  assert.deepEqual(mins, [1, 5, 30, 120, 360, 360]);
});

// ── worker ──────────────────────────────────────────────────────────────────
function harness({ post, claimable = true, markSentOk = true, creds = { endpoint: "https://e", apiKey: "k", jwt: "j" }, dryRun = false, refresh } = {}) {
  const log = { updates: [], posts: 0, alerts: [] };
  const row = { ...buildQueueRow(order()).row, id: 7, attempts: 0 };
  const deps = {
    dryRun,
    store: {
      claim: async (r) => (claimable ? { ...r, attempts: r.attempts + 1, status: "processing" } : null),
      markSent: async () => markSentOk,
      update: async (id, values, expected) => void log.updates.push({ id, values, expected }),
    },
    getCreds: async () => creds,
    refreshCreds: refresh,
    post: async (...a) => { log.posts++; return post(...a); },
    alert: async (s) => void log.alerts.push(s),
  };
  return { deps, row, log };
}

test("success stores the EasyEcom order id", async () => {
  const h = harness({ post: async () => resp(200, okBody) });
  assert.equal(await processRow(h.deps, h.row), "success");
  assert.equal(h.log.updates[0].values.easyecom_order_id, "659843492");
  assert.equal(h.log.updates[0].values.status, "success");
});

test("dry-run sends nothing and writes nothing", async () => {
  const h = harness({ dryRun: true, post: async () => resp(200, okBody) });
  assert.equal(await processRow(h.deps, h.row), "dry-run");
  assert.equal(h.log.posts, 0); assert.equal(h.log.updates.length, 0);
});

test("lost claim means no POST", async () => {
  const h = harness({ claimable: false, post: async () => resp(200, okBody) });
  assert.equal(await processRow(h.deps, h.row), "skipped");
  assert.equal(h.log.posts, 0);
});

test("if the send intent cannot be recorded, nothing is sent", async () => {
  const h = harness({ markSentOk: false, post: async () => resp(200, okBody) });
  assert.equal(await processRow(h.deps, h.row), "retry");
  assert.equal(h.log.posts, 0);
});

test("missing credentials leave the row pending and untouched", async () => {
  const h = harness({ creds: null, post: async () => resp(200, okBody) });
  assert.equal(await processRow(h.deps, h.row), "not-configured");
  assert.equal(h.log.updates.length, 0);
});

test("429 goes back to pending with a backoff and clears the sent marker", async () => {
  const h = harness({ post: async () => resp(429, {}) });
  assert.equal(await processRow(h.deps, h.row), "retry");
  const u = h.log.updates[0].values;
  assert.equal(u.status, "pending"); assert.equal(u.sent_at, null); assert.ok(u.next_retry_at);
});

test("expired JWT refreshes once, then succeeds with exactly two POSTs", async () => {
  let n = 0;
  const h = harness({ post: async () => resp(++n === 1 ? 401 : 200, n === 1 ? {} : okBody), refresh: async () => ({ endpoint: "https://e", apiKey: "k", jwt: "new" }) });
  assert.equal(await processRow(h.deps, h.row), "success");
  assert.equal(h.log.posts, 2);
});

test("ambiguous outcome is parked as failed, alerts, and is never resent", async () => {
  const h = harness({ post: async () => ({ kind: "network-error", message: "timeout" }) });
  assert.equal(await processRow(h.deps, h.row), "ambiguous");
  assert.equal(h.log.posts, 1);
  assert.equal(h.log.updates[0].values.status, "failed");
  assert.equal(h.log.alerts.length, 1);
});

test("permanent rejection fails and alerts", async () => {
  const h = harness({ post: async () => resp(400, { code: 400, message: "bad sku" }) });
  assert.equal(await processRow(h.deps, h.row), "failed");
  assert.match(h.log.updates[0].values.error_message, /bad sku/);
  assert.equal(h.log.alerts.length, 1);
});

test("an invalid row is failed before any network call", async () => {
  const h = harness({ post: async () => resp(200, okBody) });
  h.row.items[0].Sku = "nope";
  assert.equal(await processRow(h.deps, h.row), "failed");
  assert.equal(h.log.posts, 0);
});

test("gives up after the max attempts", async () => {
  const h = harness({ post: async () => resp(429, {}) });
  h.row.attempts = MAX_ATTEMPTS; // claim makes it MAX+1
  assert.equal(await processRow(h.deps, h.row), "failed");
});

test("existing response parser and order-number mapping still agree", () => {
  assert.equal(parseEasyEcomResponse(okBody, 200).orderId, "659843492");
  assert.equal(easyEcomOrderNumber("order_X"), "VHSMO-X");
});

test("EasyEcom's reply is stored in response_payload for success and failure", async () => {
  const ok = harness({ post: async () => resp(200, okBody) });
  await processRow(ok.deps, ok.row);
  assert.deepEqual(ok.log.updates[0].values.response_payload, okBody);
  const bad = harness({ post: async () => resp(400, { code: 400, message: "bad sku" }) });
  await processRow(bad.deps, bad.row);
  assert.equal(bad.log.updates[0].values.response_payload.message, "bad sku");
  const net = harness({ post: async () => ({ kind: "network-error", message: "timeout" }) });
  await processRow(net.deps, net.row);
  assert.equal(net.log.updates[0].values.response_payload, null);
});
