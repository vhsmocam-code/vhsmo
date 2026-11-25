/**
 * Transactional email templates: the order confirmation and the OTP code.
 * Both share one layout (grey page, white card, dark logo strip, dark help band,
 * four icon tiles), so they look like one family.
 *
 * Pure (no imports), so they can be unit-tested directly with `node --test`.
 * Email-safe: tables and inline styles only. The only animation is an animated
 * GIF (the one thing Gmail and Outlook play). Images come from `${assetBase}/email/`
 * (built by scripts/build-email-assets.py into public/email/).
 *
 * Dark mode: Apple Mail, iOS Mail and some Outlook apps honour the "light only"
 * colour-scheme tags and keep the light design. Gmail's phone apps ignore them and
 * recolour backgrounds and text, so every image is self-contained (dark brand
 * cards and badges, edge-to-edge photos) and looks the same on either page.
 */

const INK = "#111111";
const MUTE = "#6b6b6b";
const LINE = "#e6e6e6";
const PANEL = "#f6f6f4";
const PAGE = "#f4f4f2";
const BLUE = "#1093ff";
/** Brand darkroom: the logo strip and help band (the yellow logo is invisible on white). */
const DARK = "#2a2422";
const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";

/** Sender for transactional mail (order confirmations, verification codes). */
export const NO_REPLY_FROM = "VHSMO <no-reply@vhsmo.com>";
export const OTP_FROM = NO_REPLY_FROM;
export const FOOTER_TEXT = "Questions? Write to team@vhsmo.com.";
export const DEFAULT_ASSET_BASE = "https://www.vhsmo.com";

/** The four footer tiles: icon file and label. */
export const TILES: { icon: string; label: string }[] = [
  { icon: "icon-dispatch.png", label: "Ships in 48–72 hours" },
  { icon: "icon-shipping.png", label: "Free shipping" },
  { icon: "icon-warranty.png", label: "12-month warranty" },
  { icon: "icon-support.png", label: "Customer support" },
];

/** Escapes text for safe use inside HTML. */
export function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const money = (n: unknown) =>
  `₹${Number(n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const base = (assetBase: string | undefined) =>
  String(assetBase || DEFAULT_ASSET_BASE).replace(/\/+$/, "");

/** `24 November 2026`, in India time. Empty when the date is missing or invalid. */
export function formatOrderDate(value: unknown): string {
  if (value == null || value === "") return "";
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Product photo for a colour ("Baby Pink", "Cherry Red", "Cosmic Black"), or null. */
export function productImageFor(variant: unknown, assetBase?: string): string | null {
  const v = String(variant ?? "").toLowerCase();
  const key = v.includes("pink") ? "pink" : v.includes("red") ? "red" : v.includes("black") ? "black" : null;
  return key ? `${base(assetBase)}/email/product-${key}.png` : null;
}

// ── Shared layout ───────────────────────────────────────────────────────────

function emailShell({
  preheader,
  body,
  assetBase,
  showTiles = true,
}: {
  preheader: string;
  body: string;
  assetBase: string;
  /** The four icon tiles under the help band (order confirmation only). */
  showTiles?: boolean;
}): string {
  const tiles = TILES.map(
    (t) => `<div style="display:inline-block;width:25%;min-width:120px;vertical-align:top;text-align:center;padding:4px 0 8px;">
<img src="${base(assetBase)}/email/${t.icon}" alt="" width="44" height="44" style="display:block;width:44px;height:44px;border:0;margin:0 auto 8px;">
<div style="font-family:${FONT};font-size:12px;line-height:1.4;color:${INK};padding:0 6px;">${esc(t.label)}</div>
</div>`,
  ).join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>VHSMO</title>
<style>
:root { color-scheme: light only; supported-color-schemes: light only; }
</style>
</head>
<body style="margin:0;padding:0;background:${PAGE};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${PAGE};">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${PAGE}" style="background:${PAGE};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="max-width:600px;background:#ffffff;font-family:${FONT};color:${INK};font-size:15px;line-height:1.6;">
<tr><td align="center" bgcolor="${DARK}" style="background:${DARK};padding:28px 20px;"><img src="${base(assetBase)}/email/logo.png" alt="VHSMO" width="170" height="60" style="display:block;width:170px;max-width:60%;height:auto;border:0;margin:0 auto;color:#ffffff;font-family:${FONT};font-size:16px;font-weight:700;letter-spacing:3px;"></td></tr>
<tr><td style="padding:36px 28px 32px;">
${body}
</td></tr>
<tr><td align="center" bgcolor="${DARK}" style="background:${DARK};padding:16px 20px;font-family:${FONT};font-size:14px;color:#ffffff;">Questions? Write to <a href="mailto:team@vhsmo.com" style="color:#ffffff;font-weight:700;text-decoration:underline;">team@vhsmo.com</a></td></tr>
${showTiles ? `<tr><td align="center" style="padding:18px 8px 14px;font-size:0;line-height:0;">${tiles}</td></tr>` : ""}
</table>
</td></tr>
</table>
</body>
</html>`;
}

const h1 = (text: string) =>
  `<h1 style="margin:0 0 10px;font-size:28px;line-height:1.25;font-weight:800;text-align:center;color:${INK};">${esc(text)}</h1>`;

// ── OTP email ───────────────────────────────────────────────────────────────

export function renderOtpEmail(
  code: string,
  ttlMinutes = 10,
  assetBase: string = DEFAULT_ASSET_BASE,
): { html: string; text: string } {
  const body = `
${h1("Your verification code")}
<p style="margin:0 0 24px;text-align:center;color:${MUTE};">Enter this code at checkout to confirm your email and complete your VHSMO order.</p>
<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto;">
<tr><td align="center" bgcolor="${PANEL}" style="background:${PANEL};border:1px solid ${LINE};border-radius:12px;padding:16px 28px;">
<span style="font-family:${MONO};font-size:34px;line-height:1.2;font-weight:700;letter-spacing:8px;color:${INK};-webkit-user-select:all;user-select:all;">${esc(code)}</span>
</td></tr>
</table>
<p style="margin:10px 0 24px;text-align:center;font-size:13px;color:${MUTE};">Tap the code to select it, then copy.</p>
<p style="margin:0;text-align:center;font-size:13px;color:${MUTE};">This code expires in ${ttlMinutes} minutes. If you didn't request it, you can ignore this email.</p>`;

  const html = emailShell({
    preheader: `Your VHSMO verification code is ${code}`,
    body,
    assetBase,
    showTiles: false,
  });
  const text = [
    "VHSMO",
    "",
    "Your verification code",
    "Enter this code at checkout to confirm your email and complete your VHSMO order.",
    "",
    code,
    "",
    `This code expires in ${ttlMinutes} minutes. If you didn't request it, you can ignore this email.`,
    "",
    FOOTER_TEXT,
  ].join("\n");
  return { html, text };
}

// ── Order confirmation ──────────────────────────────────────────────────────

export interface ConfirmationItem {
  name?: string | null;
  variant?: string | null;
  quantity?: number | null;
  price?: number | null;
}

export interface ConfirmationArgs {
  name: string;
  /** Already formatted for display (no `order_` prefix). */
  orderId: string;
  paymentId?: string | null;
  paymentMethod?: "prepaid" | "cod";
  codFee?: number;
  items?: ConfirmationItem[];
  subtotal?: number | null;
  discount?: number | null;
  total: number;
  orderUrl: string;
  /** When the order was placed or paid (ISO string or Date). */
  orderDate?: string | Date | null;
  shipping?: {
    address1?: string | null;
    address2?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postalCode?: string | null;
  };
  dispatchEta: string;
  deliveryNote: string;
  /** Site origin the email images are served from, e.g. https://www.vhsmo.com */
  assetBase?: string;
}

export function renderOrderConfirmation(a: ConfirmationArgs): {
  html: string;
  text: string;
} {
  const assetBase = base(a.assetBase);
  const isCod = a.paymentMethod === "cod";
  const first = String(a.name ?? "").trim().split(/\s+/)[0] || "there";
  const heading = isCod ? "Your order is placed." : "Your order is confirmed.";
  const date = formatOrderDate(a.orderDate);

  // Summary (left column)
  const summary: [string, string][] = [["Order number", "#" + a.orderId]];
  if (date) summary.push(["Order date", date]);
  summary.push(["Order total", money(a.total)]);
  if (isCod) {
    summary.push(["Payment", "Cash on Delivery"]);
    summary.push(["Due on delivery", money(a.total)]);
  } else {
    summary.push(["Payment", "Paid online"]);
    if (a.paymentId) summary.push(["Payment ID", a.paymentId]);
  }

  // Items and totals
  const items = (a.items ?? []).filter((i) => i && (i.name || i.variant));
  const unitCount = items.reduce((n, i) => n + Math.max(1, Number(i.quantity) || 1), 0);
  const totals: [string, string][] = [];
  if (a.subtotal != null && items.length) {
    totals.push([`Subtotal (${unitCount} ${unitCount === 1 ? "item" : "items"})`, money(a.subtotal)]);
  }
  totals.push(["Shipping", "Free"]);
  if ((a.discount ?? 0) > 0) totals.push(["Discount", `− ${money(a.discount)}`]);
  if (isCod && (a.codFee ?? 0) > 0) totals.push(["Cash on Delivery fee", money(a.codFee)]);
  totals.push(["Order total", money(a.total)]);

  const s = a.shipping ?? {};
  const addressLines = [
    a.name,
    s.address1,
    s.address2,
    [s.city, s.state, s.postalCode].filter(Boolean).join(", "),
    s.country,
  ]
    .map((l) => String(l ?? "").trim())
    .filter(Boolean);

  const label = (t: string) =>
    `<div style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${INK};margin:0 0 8px;">${esc(t)}</div>`;

  const summaryRows = summary
    .map(
      ([l, v]) => `<tr>
<td style="padding:2px 10px 2px 0;font-size:13px;color:${MUTE};white-space:nowrap;vertical-align:top;">${esc(l)}</td>
<td style="padding:2px 0;font-size:13px;color:${INK};word-break:break-word;overflow-wrap:anywhere;">${esc(v)}</td>
</tr>`,
    )
    .join("");

  const summaryBox = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;border:1px solid ${LINE};background:${PANEL};" bgcolor="${PANEL}">
<tr><td style="padding:6px 0;font-size:0;line-height:0;">
<div style="display:inline-block;width:50%;min-width:240px;vertical-align:top;">
<div style="padding:14px 20px;font-family:${FONT};line-height:1.5;">${label("Summary")}<table role="presentation" cellpadding="0" cellspacing="0">${summaryRows}</table></div>
</div><div style="display:inline-block;width:50%;min-width:240px;vertical-align:top;">
<div style="padding:14px 20px;font-family:${FONT};font-size:14px;line-height:1.6;color:${INK};">${label("Shipping address")}${addressLines.map(esc).join("<br>")}</div>
</div>
</td></tr>
</table>`;

  const th = (t: string, align: string, width = "") =>
    `<td align="${align}" ${width ? `width="${width}"` : ""} style="padding:12px 14px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${INK};">${esc(t)}</td>`;

  const itemRows = items
    .map((i) => {
      const qty = Math.max(1, Number(i.quantity) || 1);
      const img = productImageFor(i.variant, assetBase);
      const photo = img
        ? `<img src="${img}" alt="" width="64" height="64" style="display:block;width:64px;height:64px;border:0;border-radius:6px;">`
        : "";
      return `<tr>
<td style="padding:14px;border-bottom:1px solid ${LINE};">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
${photo ? `<td width="76" style="padding:0 12px 0 0;vertical-align:middle;">${photo}</td>` : ""}
<td style="vertical-align:middle;font-size:14px;line-height:1.4;color:${INK};"><strong>${esc(i.name)}</strong>${i.variant ? `<br><span style="color:${MUTE};">${esc(i.variant)}</span>` : ""}</td>
</tr></table>
</td>
<td align="center" width="50" style="padding:14px 6px;border-bottom:1px solid ${LINE};font-size:14px;color:${INK};">${qty}</td>
<td align="right" width="90" style="padding:14px;border-bottom:1px solid ${LINE};font-size:14px;font-weight:700;color:${INK};white-space:nowrap;">${esc(money((Number(i.price) || 0) * qty))}</td>
</tr>`;
    })
    .join("");

  const itemsTable = items.length
    ? `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
<tr bgcolor="${PANEL}" style="background:${PANEL};">${th("Items ordered", "left")}${th("Qty", "center", "50")}${th("Price", "right", "90")}</tr>
${itemRows}
</table>`
    : "";

  const totalsTable = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 0;">
${totals
  .map(([l, v], idx) => {
    const last = idx === totals.length - 1;
    const st = last
      ? `padding:10px 14px 0;font-size:16px;font-weight:800;color:${INK};border-top:1px solid ${LINE};`
      : `padding:3px 14px;font-size:14px;color:${INK};`;
    return `<tr><td align="right" style="${st}">${esc(l)}:</td><td align="right" width="100" style="${st}white-space:nowrap;">${esc(v)}</td></tr>`;
  })
  .join("")}
</table>`;

  const codNote = isCod
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;"><tr><td bgcolor="${PANEL}" style="background:${PANEL};border:1px solid ${LINE};padding:14px 18px;font-size:14px;color:${INK};text-align:center;">Please keep <strong>${esc(money(a.total))}</strong> ready in cash or UPI for the delivery partner.</td></tr></table>`
    : "";

  const body = `
${h1(heading)}
<p style="margin:0 0 20px;text-align:center;color:${MUTE};">Thanks, ${esc(first)}! We're getting your VHSMO ready.</p>
<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
<tr><td bgcolor="${DARK}" style="background:${DARK};border-radius:12px;line-height:0;">
<img src="${assetBase}/email/van.gif" alt="" width="300" height="75" style="display:block;width:300px;max-width:100%;height:auto;border:0;border-radius:12px;">
</td></tr>
</table>
<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto;">
<tr><td align="center" bgcolor="${BLUE}" style="background:${BLUE};border-radius:6px;">
<a href="${esc(a.orderUrl)}" style="display:inline-block;padding:14px 34px;font-family:${FONT};font-size:14px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#ffffff;text-decoration:none;">View your order</a>
</td></tr>
</table>
<p style="margin:12px 0 0;text-align:center;font-size:13px;color:${MUTE};">We'll email tracking details once it ships.</p>
${summaryBox}
${itemsTable}
${totalsTable}
${codNote}
<p style="margin:28px 0 0;text-align:center;font-size:13px;color:${MUTE};">Ships within ${esc(a.dispatchEta)}. Delivery takes ${esc(a.deliveryNote)}.</p>`;

  const html = emailShell({
    preheader: `${heading} Order #${a.orderId}.`,
    body,
    assetBase,
  });

  const pad = (l: string, v: string) => `${l}: ${v}`;
  const text = [
    "VHSMO",
    "",
    heading,
    `Thanks, ${first}! We're getting your VHSMO ready.`,
    "",
    ...summary.map(([l, v]) => pad(l, v)),
    "",
    ...items.map((i) => {
      const qty = Math.max(1, Number(i.quantity) || 1);
      const label = [i.name, i.variant].filter(Boolean).join(" · ") + (qty > 1 ? ` × ${qty}` : "");
      return pad(label, money((Number(i.price) || 0) * qty));
    }),
    ...totals.map(([l, v]) => pad(l, v)),
    "",
    "Shipping address:",
    ...addressLines,
    "",
    `Ships within ${a.dispatchEta}. Delivery takes ${a.deliveryNote}.`,
    ...(isCod ? ["", `Please keep ${money(a.total)} ready in cash or UPI for the delivery partner.`] : []),
    "",
    `View your order: ${a.orderUrl}`,
    "",
    FOOTER_TEXT,
  ].join("\n");

  return { html, text };
}
