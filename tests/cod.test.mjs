import test from "node:test";
import assert from "node:assert/strict";
import {
  COD_FEE, codTotal, normalizeIndianMobile, generateOtp, hashOtp, safeEqualHex,
  signOtpToken, verifyOtpToken, generateCodOrderId, isCodOrderId, OTP_TOKEN_TTL_MINUTES,
  cleanEmail, isValidEmail, normalizeEmail, isDisposableEmail, parseContact,
} from "../src/lib/cod/core.ts";
import { COD_FEE_DISPLAY } from "../src/lib/cod/fee.ts";
import {
  buildQueueRow, buildOutboundPayload, validateRow, easyEcomOrderNumber,
  PAYMENT_MODE_COD, PAYMENT_MODE_PREPAID,
} from "../src/lib/easyecom/core.ts";

const SECRET = "test-secret-0123456789abcdef";

test("COD fee is ₹200 and the browser copy matches the server value", () => {
  assert.equal(COD_FEE, 200);
  assert.equal(COD_FEE_DISPLAY, COD_FEE);
});

test("a coupon reduces the cart, never the COD fee", () => {
  assert.equal(codTotal({ subtotal: 6999, shippingCost: 0, tax: 0, discount: 500 }), 6699);
  // Even a coupon worth the whole cart leaves the fee to pay.
  assert.equal(codTotal({ subtotal: 999, shippingCost: 0, tax: 0, discount: 5000 }), COD_FEE);
  // No discount passed = unchanged behaviour.
  assert.equal(codTotal({ subtotal: 6999, shippingCost: 0, tax: 0 }), 6999 + COD_FEE);
});

test("COD total = subtotal + shipping + tax + fee", () => {
  assert.equal(codTotal({ subtotal: 4999, shippingCost: 0, tax: 0 }), 5199);
  assert.equal(codTotal({ subtotal: 9998, shippingCost: 100, tax: 10 }), 10308);
});

test("Indian mobile normalisation", () => {
  for (const v of ["9876543210", "98765 43210", "+91 98765-43210", "919876543210", "09876543210"]) {
    assert.equal(normalizeIndianMobile(v), "9876543210", v);
  }
  for (const v of ["", "12345", "5876543210", "98765432101", null, undefined, "abc"]) {
    assert.equal(normalizeIndianMobile(v), null, String(v));
  }
});

test("OTP is 6 digits and its hash is bound to the phone", () => {
  for (let i = 0; i < 50; i++) assert.match(generateOtp(), /^\d{6}$/);
  const h = hashOtp(SECRET, "9876543210", "123456");
  assert.ok(safeEqualHex(h, hashOtp(SECRET, "9876543210", "123456")));
  assert.ok(!safeEqualHex(h, hashOtp(SECRET, "9876543211", "123456")));
  assert.ok(!safeEqualHex(h, hashOtp(SECRET, "9876543210", "123457")));
  assert.ok(!safeEqualHex(h, ""));
});

test("verification token: valid, wrong phone, expired, tampered, wrong secret", () => {
  const now = new Date("2026-11-24T10:00:00Z");
  const t = signOtpToken(SECRET, "otp-id-1", "9876543210", now);
  assert.deepEqual(verifyOtpToken(SECRET, t, "9876543210", now), { ok: true, otpId: "otp-id-1", identity: "9876543210" });
  assert.equal(verifyOtpToken(SECRET, t, "9999999999", now).ok, false);
  const late = new Date(now.getTime() + OTP_TOKEN_TTL_MINUTES * 60_000 + 1000);
  assert.match(verifyOtpToken(SECRET, t, "9876543210", late).reason, /expired/);
  const [body, mac] = t.split(".");
  const forged = Buffer.from(JSON.stringify({ i: "otp-id-1", s: "9999999999", e: 9999999999999 })).toString("base64url");
  assert.equal(verifyOtpToken(SECRET, `${forged}.${mac}`, "9999999999", now).ok, false);
  assert.equal(verifyOtpToken("another-secret-0123456789", t, "9876543210", now).ok, false);
  assert.equal(verifyOtpToken(SECRET, undefined, "9876543210", now).ok, false);
  assert.equal(verifyOtpToken(SECRET, body, "9876543210", now).ok, false);
});

test("COD order ids keep the order_ prefix and map to VHSMO-COD…", () => {
  const ids = new Set();
  for (let i = 0; i < 200; i++) {
    const id = generateCodOrderId();
    assert.ok(isCodOrderId(id), id);
    assert.ok(id.startsWith("order_"));
    assert.match(easyEcomOrderNumber(id), /^VHSMO-COD[A-Z0-9]{12}$/);
    ids.add(id);
  }
  assert.equal(ids.size, 200);
  assert.equal(isCodOrderId("order_THk58ch0pfaSZ1"), false);
});

const order = (over = {}) => ({
  id: "625657b2-ac30-4367-a9d9-eae420babd41",
  razorpay_order_id: "order_CODABCDEFGH2345",
  customer_name: "Test User", email: "t@example.com", phone: "9999999999",
  address_line1: "1 Street", address_line2: null, city: "Pune", state: "Maharashtra",
  country: "India", postal_code: "411021", discount: 0,
  payment_method: "cod", cod_fee: 200,
  items: [{ productId: "x", name: "VHSMO Vol. 1", variant: "Cherry Red", quantity: 1, price: 4999, total: 4999 }],
  ...over,
});

test("EasyEcom: COD order → paymentMode 2 with the ₹200 fee as shippingCost", () => {
  const r = buildQueueRow(order());
  assert.ok(r.ok);
  assert.equal(r.row.paymentMode, PAYMENT_MODE_COD);
  assert.equal(r.row.request_payload.paymentMode, 2);
  assert.equal(r.row.request_payload.shippingCost, 200);
  assert.deepEqual(validateRow(r.row), []);

  const out = buildOutboundPayload({ ...r.row, id: 1, status: "processing", attempts: 1 }, new Date("2026-11-24T00:00:00Z"));
  assert.equal(out.paymentMode, 2);
  assert.equal(out.shippingCost, 200);
  assert.equal(out.orderNumber, "VHSMO-CODABCDEFGH2345");
  // Collectable = items - discounts + fee = what the customer was shown.
  const collect = out.items.reduce((s, it) => s + it.Price * it.Quantity - it.itemDiscount, 0) + out.shippingCost;
  assert.equal(collect, 5199);
});

test("EasyEcom: prepaid order is unchanged (paymentMode 5, no shippingCost)", () => {
  const r = buildQueueRow(order({ razorpay_order_id: "order_THk58ch0pfaSZ1", payment_method: "prepaid", cod_fee: 0 }));
  assert.equal(r.row.paymentMode, PAYMENT_MODE_PREPAID);
  assert.equal("shippingCost" in r.row.request_payload, false);
  const out = buildOutboundPayload({ ...r.row, id: 1, status: "processing", attempts: 1 });
  assert.equal(out.paymentMode, 5);
  assert.equal("shippingCost" in out, false);
});

test("EasyEcom: legacy rows with no payment_method stay prepaid", () => {
  const { payment_method, cod_fee, ...legacy } = order({ razorpay_order_id: "order_THk58ch0pfaSZ1" });
  const r = buildQueueRow(legacy);
  assert.equal(r.row.paymentMode, 5);
  const out = buildOutboundPayload({ ...r.row, paymentMode: null, id: 1, status: "pending", attempts: 0 });
  assert.equal(out.paymentMode, 5);
});

test("EasyEcom: unknown paymentMode fails validation", () => {
  const r = buildQueueRow(order());
  assert.ok(validateRow({ ...r.row, paymentMode: 7 }).some((e) => /paymentMode/.test(e)));
});

// ── Message Central VerifyNow response parsing (codes from the API doc) ─────
import {
  parseTokenResponse, parseSendResponse, parseValidateResponse, jwtExpiryMs, tokenValidUntil,
} from "../src/lib/cod/messagecentral-core.ts";

const jwt = (exp) => `h.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.s`;

test("Message Central: token response variants and expiry", () => {
  const t = "eyJhbGciOiJIUzUxMiJ9.payload.sig";
  assert.equal(parseTokenResponse({ status: 200, token: t }), t);
  assert.equal(parseTokenResponse({ data: { token: t } }), t);
  assert.equal(parseTokenResponse({ status: 200 }), null);
  assert.equal(parseTokenResponse(null), null);
  assert.equal(jwtExpiryMs(jwt(2000000000)), 2000000000 * 1000);
  assert.equal(jwtExpiryMs("garbage"), null);
  const now = 1_700_000_000_000;
  assert.equal(tokenValidUntil("garbage", now), now + 600_000);
  assert.equal(tokenValidUntil(jwt(now / 1000 + 3600), now), now + 3_600_000 - 60_000);
});

test("Message Central: send response", () => {
  const ok = { responseCode: 200, message: "SUCCESS", data: { verificationId: "2949", responseCode: "200", timeout: "60" } };
  assert.deepEqual(parseSendResponse(200, ok), { ok: true, verificationId: "2949" });
  assert.equal(parseSendResponse(200, { ...ok, data: { ...ok.data, verificationId: "abc" } }).ok, false);
  assert.equal(parseSendResponse(200, { responseCode: 200, data: {} }).ok, false);
  assert.equal(parseSendResponse(200, { responseCode: 511 }).reason, "invalid-number");
  assert.equal(parseSendResponse(200, { responseCode: 506 }).reason, "rate-limited");
  assert.equal(parseSendResponse(200, { responseCode: 800 }).reason, "rate-limited");
  assert.equal(parseSendResponse(401, null).reason, "auth");
  assert.equal(parseSendResponse(200, { responseCode: 501 }).reason, "auth");
  assert.equal(parseSendResponse(500, { responseCode: 500 }).reason, "error");
});

test("Message Central: validate response maps every documented code", () => {
  const body = (code, status) => ({ responseCode: code, data: status ? { verificationStatus: status } : {} });
  assert.equal(parseValidateResponse(200, body(200, "VERIFICATION_COMPLETED")), "verified");
  // A 200 without the completed status must NOT count as verified.
  assert.equal(parseValidateResponse(200, body(200, "PENDING")), "error");
  assert.equal(parseValidateResponse(200, body(200)), "error");
  assert.equal(parseValidateResponse(200, body(702)), "wrong");
  assert.equal(parseValidateResponse(200, body(705)), "expired");
  assert.equal(parseValidateResponse(200, body(703)), "already-verified");
  assert.equal(parseValidateResponse(200, body(800)), "limit");
  assert.equal(parseValidateResponse(200, body(505)), "unknown-request");
  assert.equal(parseValidateResponse(401, null), "auth");
  assert.equal(parseValidateResponse(200, body(999)), "error");
  assert.equal(parseValidateResponse(200, null), "error");
});

// ── Email OTP ───────────────────────────────────────────────────────────────
import { maskEmail } from "../src/lib/cod/format.ts";
import { renderOtpEmail, renderOrderConfirmation, esc, OTP_FROM, NO_REPLY_FROM, FOOTER_TEXT } from "../src/lib/email/templates.ts";

test("token works for emails with dots and plus signs and binds to the exact email", () => {
  const now = new Date("2026-11-24T10:00:00Z");
  const email = "first.last+shop@example.co.in";
  const t = signOtpToken(SECRET, "otp-9", email, now);
  assert.deepEqual(verifyOtpToken(SECRET, t, email, now), { ok: true, otpId: "otp-9", identity: email });
  assert.equal(verifyOtpToken(SECRET, t, "other@example.com", now).ok, false);
  assert.equal(verifyOtpToken(SECRET, "x.y", email, now).ok, false);
  assert.equal(verifyOtpToken(SECRET, "", email, now).ok, false);
});

test("email cleaning, validation and normalisation", () => {
  assert.equal(cleanEmail("  Foo@Bar.COM "), "foo@bar.com");
  for (const ok of ["a@b.co", "john.doe+x@gmail.com", "x_y@sub.domain.in"]) assert.ok(isValidEmail(ok), ok);
  for (const bad of ["", "a@b", "a b@c.com", "@c.com", "a@.com", "plain"]) assert.ok(!isValidEmail(bad), bad);
  // The same mailbox written different ways collapses to one limit key.
  assert.equal(normalizeEmail("J.Doe+offer@Gmail.com"), "jdoe@gmail.com");
  assert.equal(normalizeEmail("jdoe@googlemail.com"), "jdoe@gmail.com");
  assert.equal(normalizeEmail("a.b+c@example.com"), "a.b@example.com"); // dots kept off Gmail
});

test("disposable email domains are rejected, normal ones are not", () => {
  assert.ok(isDisposableEmail("x@mailinator.com"));
  assert.ok(isDisposableEmail("X@YOPMAIL.com"));
  assert.ok(!isDisposableEmail("x@gmail.com"));
  assert.equal(parseContact("email", { email: "x@mailinator.com" }).ok, false);
});

test("parseContact picks the right field per channel", () => {
  assert.deepEqual(parseContact("email", { email: " A@B.com " }), { ok: true, contact: "a@b.com" });
  assert.equal(parseContact("email", { email: "nope" }).ok, false);
  assert.deepEqual(parseContact("sms", { phone: "+91 98765 43210" }), { ok: true, contact: "9876543210" });
  assert.equal(parseContact("sms", { phone: "123" }).ok, false);
});

test("email hash is bound to the email and the code", () => {
  const h = hashOtp(SECRET, "a@b.com", "123456");
  assert.ok(safeEqualHex(h, hashOtp(SECRET, "a@b.com", "123456")));
  assert.ok(!safeEqualHex(h, hashOtp(SECRET, "c@d.com", "123456")));
});

test("maskEmail hides the name", () => {
  assert.equal(maskEmail("John.Doe@Gmail.com"), "j•••@gmail.com");
});

test("OTP email carries the code, comes from no-reply@, and leaks nothing else", () => {
  const { html, text } = renderOtpEmail("482913");
  for (const out of [html, text]) {
    assert.ok(out.includes("482913"));
    assert.ok(out.includes("10 minutes"));
  }
  assert.match(OTP_FROM, /<no-reply@vhsmo\.com>$/);
  assert.ok(!/secret|token|password/i.test(html));
});


// ── Order ID display (full ID, only `order_` removed) ───────────────────────
import { displayOrderId } from "../src/lib/order-id.ts";
import { normalizeOrderIdInput, validateOrderId } from "../src/lib/refund-validation.ts";

test("displayOrderId removes only the order_ prefix: no trimming, no case change", () => {
  assert.equal(displayOrderId("order_THk58ch0pfaSZ1"), "THk58ch0pfaSZ1");
  assert.equal(displayOrderId("order_CODLJRAVJC6784C"), "CODLJRAVJC6784C");
  assert.equal(displayOrderId("  order_abcDEF123xyz99  "), "abcDEF123xyz99");
  assert.equal(displayOrderId("ORDER_abcDEF123xyz99"), "abcDEF123xyz99");
  assert.equal(displayOrderId("THk58ch0pfaSZ1"), "THk58ch0pfaSZ1"); // already bare
  assert.equal(displayOrderId("order_order_x"), "order_x"); // only the leading one
  assert.equal(displayOrderId(null), "");
  assert.equal(displayOrderId(undefined), "");
});

test("refund form accepts the Order ID with or without order_", () => {
  assert.equal(normalizeOrderIdInput("THk58ch0pfaSZ1"), "order_THk58ch0pfaSZ1");
  assert.equal(normalizeOrderIdInput(" order_THk58ch0pfaSZ1 "), "order_THk58ch0pfaSZ1");
  assert.equal(validateOrderId("THk58ch0pfaSZ1"), undefined);
  assert.equal(validateOrderId("order_THk58ch0pfaSZ1"), undefined);
  assert.equal(validateOrderId("CODLJRAVJC6784C"), undefined); // a COD ID, shown without order_
  // Round trip: what the customer sees is accepted and maps back to the stored ID.
  assert.equal(normalizeOrderIdInput(displayOrderId("order_CODLJRAVJC6784C")), "order_CODLJRAVJC6784C");
});

test("refund form still rejects wrong IDs", () => {
  assert.match(validateOrderId("pay_ABCdef1234567"), /Payment ID/);
  assert.match(validateOrderId("rfnd_ABCdef1234567"), /Refund ID/);
  assert.ok(validateOrderId(""));
  assert.ok(validateOrderId("short"));
  assert.ok(validateOrderId("has space inside 1234"));
});

// ── Email design (shared layout, confirmation, OTP) ─────────────────────────
import { formatOrderDate, productImageFor, TILES } from "../src/lib/email/templates.ts";

const ASSETS = "https://www.vhsmo.com";
const ship = { address1: "20 Aasmant Society", address2: "", city: "Pune", state: "Maharashtra", country: "India", postalCode: "411021" };
const confirmArgs = (over = {}) => ({
  name: "Test User", orderId: "THk58ch0pfaSZ1", paymentId: "pay_ABC123", paymentMethod: "prepaid",
  items: [{ name: "VHSMO Vol. 1", variant: "Cosmic Black", quantity: 1, price: 6999 }],
  subtotal: 6999, discount: 0, total: 6999, orderUrl: "https://vhsmo.com/checkout/success?order=order_THk58ch0pfaSZ1",
  orderDate: "2026-11-24T15:59:47Z", shipping: ship, dispatchEta: "48–72 hours", deliveryNote: "2–7 business days",
  assetBase: ASSETS, ...over,
});

test("confirmation (online): headline, summary, full ID, date, photo, totals", () => {
  const { html, text } = renderOrderConfirmation(confirmArgs());
  for (const out of [html, text]) {
    assert.ok(out.includes("Your order is confirmed."));
    assert.ok(out.includes("THk58ch0pfaSZ1"));
    assert.ok(out.includes("24 November 2026"));
    assert.ok(out.includes("Paid online"));
    assert.ok(out.includes("pay_ABC123"));
    assert.ok(out.includes("Subtotal (1 item)"));
    assert.ok(out.includes("₹6,999"));
    assert.ok(out.includes("Pune, Maharashtra, 411021"));
    assert.ok(!/Cash on Delivery/.test(out));
  }
  assert.ok(html.includes(`${ASSETS}/email/van.gif`), "animated van");
  assert.ok(html.includes(`${ASSETS}/email/product-black.png`), "photo matched by colour");
  assert.match(html, /<a href="https:\/\/vhsmo\.com\/checkout\/success\?order=order_THk58ch0pfaSZ1"[^>]*>View your order<\/a>/);
  assert.ok(html.includes("Summary") && html.includes("Shipping address") && html.includes("Items ordered"));
});

test("confirmation (COD): placed headline, fee, amount due, no payment id", () => {
  const { html, text } = renderOrderConfirmation(confirmArgs({
    orderId: "CODLJRAVJC6784C", paymentMethod: "cod", paymentId: "", codFee: 200, total: 7199,
  }));
  for (const out of [html, text]) {
    assert.ok(out.includes("Your order is placed."));
    assert.ok(out.includes("Cash on Delivery"));
    assert.ok(out.includes("Due on delivery"));
    assert.ok(out.includes("Cash on Delivery fee"));
    assert.ok(out.includes("₹200") && out.includes("₹7,199"));
    assert.ok(!/Payment ID/.test(out));
  }
});

test("confirmation: discount only when present, item counts, copes with no items or date", () => {
  assert.ok(!/Discount/.test(renderOrderConfirmation(confirmArgs()).text));
  assert.ok(/Discount: − ₹500/.test(renderOrderConfirmation(confirmArgs({ discount: 500, total: 6499 })).text));
  const two = renderOrderConfirmation(confirmArgs({ items: [{ name: "VHSMO Vol. 1", variant: "Baby Pink", quantity: 2, price: 6999 }], subtotal: 13998, total: 13998 }));
  assert.ok(two.text.includes("Subtotal (2 items)") && two.html.includes("product-pink.png"));
  const bare = renderOrderConfirmation(confirmArgs({ items: undefined, subtotal: undefined, orderDate: null }));
  assert.ok(bare.text.includes("Order total: ₹6,999"));
  assert.ok(!/Subtotal|Order date|Items ordered/.test(bare.html));
});

test("confirmation escapes user-provided text", () => {
  const { html } = renderOrderConfirmation(confirmArgs({
    name: '<script>alert(1)</script> Bob', shipping: { ...ship, address1: '<img src=x onerror=alert(1)>' },
    items: [{ name: "<b>Cam</b>", variant: "A&B", quantity: 1, price: 1 }],
  }));
  assert.ok(!html.includes("<script>") && !html.includes("<img src=x") && !html.includes("<b>Cam"));
  assert.ok(html.includes("&lt;script&gt;") && html.includes("A&amp;B"));
  assert.equal(esc(`"'<&>`), "&quot;&#39;&lt;&amp;&gt;");
});

test("both emails share the logo strip and help band; only the confirmation has the four tiles", () => {
  const otp = renderOtpEmail("482913", 10, ASSETS).html;
  const confirm = renderOrderConfirmation(confirmArgs()).html;
  for (const html of [otp, confirm]) {
    assert.ok(html.includes(`<img src="${ASSETS}/email/logo.png" alt="VHSMO"`), "logo on its own dark card");
    assert.ok(html.includes("Questions? Write to <a href=\"mailto:team@vhsmo.com\""));
  }
  for (const t of TILES) {
    assert.ok(confirm.includes(`${ASSETS}/email/${t.icon}`) && confirm.includes(t.label));
    assert.ok(!otp.includes(t.icon) && !otp.includes(t.label), `OTP email has no ${t.label} tile`);
  }
});

test("every image is a full link to a non-WebP file, and the HTML stays under Gmail's clip size", () => {
  const pages = [renderOtpEmail("482913", 10, ASSETS).html, renderOrderConfirmation(confirmArgs({ paymentMethod: "cod", codFee: 200 })).html];
  for (const html of pages) {
    const srcs = [...html.matchAll(/<img src="([^"]+)"/g)].map((m) => m[1]);
    assert.ok(srcs.length >= 1);
    for (const src of srcs) {
      assert.ok(src.startsWith(`${ASSETS}/email/`) || src.startsWith("https://res.cloudinary.com/"), src);
      assert.ok(!/\.webp$/i.test(src), src);
    }
    assert.ok(Buffer.byteLength(html) < 60_000, `HTML is ${Buffer.byteLength(html)} bytes`);
  }
});

test("asset base trailing slash and default are handled", () => {
  assert.ok(renderOrderConfirmation(confirmArgs({ assetBase: "http://localhost:3000/" })).html.includes("http://localhost:3000/email/van.gif"));
  assert.ok(renderOrderConfirmation(confirmArgs({ assetBase: undefined })).html.includes("https://www.vhsmo.com/email/van.gif"));
  assert.equal(productImageFor("Cherry Red", ASSETS), `${ASSETS}/email/product-red.png`);
  assert.equal(productImageFor("Ocean Blue", ASSETS), null);
  assert.equal(formatOrderDate("not a date"), "");
});

test("transactional mail comes from no-reply@, and the footer doesn't invite replies to it", () => {
  assert.equal(NO_REPLY_FROM, "VHSMO <no-reply@vhsmo.com>");
  assert.equal(OTP_FROM, NO_REPLY_FROM);
  assert.ok(!/reply to this email/i.test(FOOTER_TEXT));
  for (const out of [renderOtpEmail("123456"), renderOrderConfirmation(confirmArgs())]) {
    assert.ok(!/reply to this email/i.test(out.html) && !/reply to this email/i.test(out.text));
  }
});

test("OTP email: code in a tap-to-select box with a hint, plain text has the code alone", () => {
  const { html, text } = renderOtpEmail("482913", 10, ASSETS);
  assert.match(html, /user-select:all;">482913<\/span>/);
  assert.ok(html.includes("Tap the code to select it, then copy."));
  assert.ok(html.includes("10 minutes"));
  assert.ok(text.split("\n").includes("482913"));
});

test("both emails ask mail apps to keep the light design (colour-scheme light only)", () => {
  for (const html of [renderOtpEmail("482913", 10, ASSETS).html, renderOrderConfirmation(confirmArgs()).html]) {
    assert.ok(html.includes('<meta name="color-scheme" content="light only">'));
    assert.ok(html.includes('<meta name="supported-color-schemes" content="light only">'));
    assert.match(html, /:root \{ color-scheme: light only; supported-color-schemes: light only; \}/);
  }
});

test("the van sits in a rounded dark card cell, so it reads as a card even before it loads", () => {
  const html = renderOrderConfirmation(confirmArgs()).html;
  assert.match(html, /<td bgcolor="#2a2422" style="background:#2a2422;border-radius:12px;line-height:0;">\s*<img src="https:\/\/www\.vhsmo\.com\/email\/van\.gif"/);
});
