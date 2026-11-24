/**
 * Simple, minimal email templates: the order confirmation and the OTP code.
 * Pure (no imports), so they can be unit-tested directly with `node --test`.
 *
 * Design: white page, near-black text, one grey, hairline dividers. No images,
 * no coloured bands, no buttons. It reads the same in light and dark mode.
 */

const INK = "#111111";
const MUTE = "#6b6b6b";
const LINE = "#e6e6e6";
/** Brand darkroom: the strip behind the yellow logo (the logo is invisible on white). */
const HEADER_BG = "#2a2422";
const LOGO_URL =
  "https://res.cloudinary.com/jyejt2p3/image/upload/v1784963870/Frame_58_jtqo1t.png";
const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

/** Sender for transactional mail (order confirmations, verification codes). */
export const NO_REPLY_FROM = "VHSMO <no-reply@vhsmo.com>";
export const OTP_FROM = NO_REPLY_FROM;
export const FOOTER_TEXT = "Questions? Write to team@vhsmo.com.";

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

/** The shared page: an inset dark logo strip, plain white content, one grey footer line. */
function emailShell({ preheader, body }: { preheader: string; body: string }): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>VHSMO</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#ffffff;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
<tr><td align="center" style="padding:24px 20px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;font-family:${FONT};color:${INK};font-size:15px;line-height:1.6;">
<tr><td align="center" bgcolor="${HEADER_BG}" style="background:${HEADER_BG};padding:28px 20px;"><img src="${LOGO_URL}" alt="VHSMO" width="150" style="display:block;width:150px;max-width:60%;height:auto;border:0;margin:0 auto;color:#ffffff;font-family:${FONT};font-size:16px;font-weight:700;letter-spacing:3px;"></td></tr>
<tr><td style="padding-top:28px;">
${body}
</td></tr>
<tr><td style="padding:32px 0 0;"><div style="border-top:1px solid ${LINE};padding-top:16px;font-size:13px;color:${MUTE};">${esc(FOOTER_TEXT)}</div></td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// ── OTP email ───────────────────────────────────────────────────────────────

export function renderOtpEmail(
  code: string,
  ttlMinutes = 10,
): { html: string; text: string } {
  const html = emailShell({
    preheader: `Your VHSMO verification code is ${code}`,
    body: `
<h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:${INK};">Your verification code</h1>
<p style="margin:0;color:${MUTE};">Use this code to place your Cash on Delivery order.</p>
<p style="margin:24px 0 4px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:32px;font-weight:700;letter-spacing:8px;color:${INK};-webkit-user-select:all;user-select:all;">${esc(code)}</p>
<p style="margin:0 0 24px;font-size:13px;color:${MUTE};">Click or tap and hold the code to select and copy it.</p>
<p style="margin:0;font-size:13px;color:${MUTE};">This code expires in ${ttlMinutes} minutes. If you didn't request it, you can ignore this email.</p>`,
  });
  const text = [
    "VHSMO",
    "",
    "Your verification code",
    "Use this code to place your Cash on Delivery order.",
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
}

export function renderOrderConfirmation(a: ConfirmationArgs): {
  html: string;
  text: string;
} {
  const isCod = a.paymentMethod === "cod";
  const first = String(a.name ?? "").trim().split(/\s+/)[0] || "there";
  const heading = isCod ? "Order placed" : "Order confirmed";
  const intro = `Thanks, ${first}. We'll email tracking details once it ships.`;

  // Details: label / value pairs.
  const details: [string, string][] = [["Order ID", a.orderId]];
  if (isCod) {
    details.push(["Payment", "Cash on Delivery"]);
    details.push(["Due on delivery", money(a.total)]);
  } else {
    if (a.paymentId) details.push(["Payment ID", a.paymentId]);
    details.push(["Paid", money(a.total)]);
  }

  // Items and totals.
  const items = (a.items ?? []).filter((i) => i && (i.name || i.variant));
  const lines: [string, string][] = items.map((i) => {
    const qty = Math.max(1, Number(i.quantity) || 1);
    const label = [i.name, i.variant].filter(Boolean).join(" · ") + (qty > 1 ? ` × ${qty}` : "");
    return [label, money((Number(i.price) || 0) * qty)];
  });
  const totals: [string, string][] = [];
  if (a.subtotal != null && items.length) totals.push(["Subtotal", money(a.subtotal)]);
  if ((a.discount ?? 0) > 0) totals.push(["Discount", `− ${money(a.discount)}`]);
  if (isCod && (a.codFee ?? 0) > 0) totals.push(["Cash on Delivery fee", money(a.codFee)]);
  totals.push(["Total", money(a.total)]);

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

  const row = (label: string, value: string, strong = false) => `
<tr>
<td style="padding:4px 16px 4px 0;color:${strong ? INK : MUTE};${strong ? "font-weight:600;" : ""}">${esc(label)}</td>
<td align="right" style="padding:4px 0;color:${INK};${strong ? "font-weight:600;" : ""}">${esc(value)}</td>
</tr>`;
  const table = (rows: string) =>
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;">${rows}</table>`;
  const rule = `<div style="border-top:1px solid ${LINE};margin:20px 0;"></div>`;

  const codNote = isCod
    ? `<p style="margin:0 0 16px;">Please keep ${esc(money(a.total))} ready in cash or UPI for the delivery partner.</p>`
    : "";

  const html = emailShell({
    preheader: `${heading}. Order ${a.orderId}.`,
    body: `
<h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:${INK};">${esc(heading)}</h1>
<p style="margin:0 0 24px;color:${MUTE};">${esc(intro)}</p>
${table(details.map(([l, v]) => row(l, v)).join(""))}
${rule}
${table(
  lines.map(([l, v]) => row(l, v)).join("") +
    totals.map(([l, v], i) => row(l, v, i === totals.length - 1)).join(""),
)}
${rule}
<p style="margin:0 0 4px;color:${MUTE};">Shipping to</p>
<p style="margin:0 0 16px;">${addressLines.map(esc).join("<br>")}</p>
<p style="margin:0 0 16px;color:${MUTE};">Ships within ${esc(a.dispatchEta)}. Delivery takes ${esc(a.deliveryNote)}.</p>
${codNote}
<p style="margin:0;"><a href="${esc(a.orderUrl)}" style="color:${INK};text-decoration:underline;">View your order</a></p>`,
  });

  const pad = (l: string, v: string) => `${l}: ${v}`;
  const text = [
    "VHSMO",
    "",
    heading,
    intro,
    "",
    ...details.map(([l, v]) => pad(l, v)),
    "",
    ...lines.map(([l, v]) => pad(l, v)),
    ...totals.map(([l, v]) => pad(l, v)),
    "",
    "Shipping to:",
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
