"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Check,
  Download,
  Home,
  Loader2,
  Mail,
  Package,
  PackageX,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type OrderItem = {
  id?: string;
  name: string;
  variant?: string;
  quantity: number;
  price: number;
  image?: string;
};

type OrderAddress = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
};

type Order = {
  orderId: string;
  paymentId: string;
  placedAt: number | null;
  customer: { name: string; email: string; phone: string };
  address: OrderAddress;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
};

/** Map a Supabase orders row into the shape the page renders. */
function fromApi(row: Record<string, any>): Order {
  const items: OrderItem[] = Array.isArray(row.items)
    ? row.items.map((it: Record<string, any>) => ({
        id: it.productId ?? it.id,
        name: it.name,
        variant: it.variant,
        quantity: Number(it.quantity ?? 1),
        price: Number(it.price ?? 0),
      }))
    : [];

  return {
    orderId: row.razorpay_order_id ?? "",
    paymentId: row.razorpay_payment_id ?? "",
    placedAt: row.created_at ? new Date(row.created_at).getTime() : null,
    customer: {
      name: row.customer_name ?? "",
      email: row.email ?? "",
      phone: row.phone ?? "",
    },
    address: {
      line1: row.address_line1,
      line2: row.address_line2,
      city: row.city,
      state: row.state,
      country: row.country,
      postalCode: row.postal_code,
    },
    items,
    subtotal: Number(row.subtotal ?? 0),
    shipping: Number(row.shipping_cost ?? 0),
    tax: Number(row.tax ?? 0),
    total: Number(row.total ?? row.amount ?? 0),
    currency: row.currency ?? "INR",
  };
}

/**
 * The checkout stashes a copy of the order (with product images) before it
 * redirects. The API row has no images, so we borrow them from the stash when
 * the order IDs line up.
 */
function mergeStashImages(order: Order, orderId: string | null): Order {
  try {
    const raw = sessionStorage.getItem("vhsmo:lastOrder");
    if (!raw) return order;
    const stash = JSON.parse(raw) as {
      orderId?: string;
      items?: { id?: string; image?: string }[];
    };
    if (orderId && stash.orderId && stash.orderId !== orderId) return order;

    const byId = new Map(
      (stash.items ?? []).map((it) => [it.id, it.image] as const),
    );
    return {
      ...order,
      items: order.items.map((it) => ({
        ...it,
        image: it.image ?? byId.get(it.id),
      })),
    };
  } catch {
    return order;
  }
}

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("order");
  const paymentId = params.get("payment");

  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    let active = true;

    async function load() {
      if (!orderId) {
        setStatus("error");
        return;
      }
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
        if (!res.ok) throw new Error("Order not found");
        const row = await res.json();
        if (!active) return;
        setOrder(mergeStashImages(fromApi(row), orderId));
        setStatus("ready");
      } catch {
        if (active) setStatus("error");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [orderId]);

  const shortId = (orderId ?? order?.orderId ?? "")
    .replace(/^order_/, "")
    .slice(-8)
    .toUpperCase();

  // No valid order behind this id - show a dedicated "not found" page and
  // never the thank-you / receipt.
  if (status === "error") {
    return (
      <div className="paper flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-full border-2 border-darkroom/15 bg-overexpose text-darkroom/50">
          <PackageX className="size-8" />
        </span>
        <h1 className="display mt-6 text-[clamp(1.75rem,5vw,3rem)] text-darkroom">
          No order found
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-darkroom/60">
          We couldn&apos;t find an order for this link
          {orderId ? (
            <>
              {" "}
              <span className="font-mono text-sm font-semibold text-darkroom">
                ({orderId})
              </span>
            </>
          ) : null}
          . It may be an invalid or expired confirmation link.
        </p>
        <Link
          href="/"
          className="mt-8 flex items-center justify-center gap-2 rounded-full bg-darkroom px-7 py-4 text-sm font-bold text-halide transition-transform hover:scale-[1.02]"
        >
          <Home className="size-4" />
          Back to home
        </Link>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="paper flex min-h-dvh flex-col items-center justify-center gap-3 text-darkroom/50">
        <Loader2 className="size-6 animate-spin" />
        <p className="text-sm">Fetching your order details…</p>
      </div>
    );
  }

  return (
    <div className="paper min-h-dvh">
      <div className="container-px mx-auto w-full max-w-[70rem] pt-28 pb-24 sm:pt-32">
        {/* ---------- Hero ---------- */}
        <div className="flex flex-col items-center text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-kodak shadow-[0.25rem_0.5rem_1.1rem_rgba(31,26,24,0.28)]">
            <Check className="size-8 text-darkroom" strokeWidth={3} />
          </span>

          <span className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-darkroom/12 bg-overexpose px-4 py-1.5 text-xs font-bold text-darkroom">
            <span className="flex size-4 items-center justify-center rounded-full bg-kodak">
              <Check className="size-2.5 text-darkroom" strokeWidth={4} />
            </span>
            Payment Successful
          </span>

          <h1 className="display mt-6 text-[clamp(2.25rem,6vw,4rem)] text-darkroom">
            Thank you for your order!
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-darkroom/60">
            Order{" "}
            <span className="font-bold text-darkroom">
              #{shortId || "VHSMO"}
            </span>{" "}
            is confirmed. We&apos;ve emailed your receipt
            {order?.customer.email ? (
              <>
                {" "}
                to{" "}
                <span className="font-semibold text-darkroom">
                  {order.customer.email}
                </span>
              </>
            ) : null}
            .
          </p>
        </div>

        {/* ---------- What happens next ---------- */}
        <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
          <Notice
            icon={Mail}
            title="Confirmation sent"
            body="A confirmation email with your order details is on its way to your inbox."
          />
          <Notice
            icon={Truck}
            title="Getting your VHSMO ready"
            body="We're assembling, testing and packing your camera. Shipping begins in 6–7 weeks."
          />
          <Notice
            icon={ShieldCheck}
            title="Problem caused by us?"
            body="Manufacturing defects are covered under our 12-month limited warranty. We'll repair or replace your VHSMO for completely free. Just reach out and we'll make it right."
          />
        </div>

        {/* ---------- Details ---------- */}
        {order && (
          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_22rem]">
            {/* Left - order items */}
            <section className="overflow-hidden rounded-2xl border-2 border-darkroom/12 bg-overexpose shadow-[0_10px_40px_-24px_rgba(31,26,24,0.4)]">
              <header className="border-b border-darkroom/10 px-6 py-5">
                <h2 className="flex items-center gap-2.5 text-lg font-bold text-darkroom">
                  <ShoppingBag className="size-5 text-darkroom/70" />
                  Order Items
                </h2>
              </header>

              <ul className="divide-y divide-darkroom/10 px-6">
                {order.items.map((item, i) => (
                  <li
                    key={`${item.id ?? i}-${item.variant ?? ""}`}
                    className="flex items-center gap-4 py-5"
                  >
                    <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-halide">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <Package className="size-6 text-darkroom/35" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-darkroom">
                        {item.name}
                      </p>
                      {item.variant && (
                        <p className="mt-0.5 text-xs text-darkroom/55">
                          {item.variant}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-darkroom/45">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-bold tabular-nums text-darkroom">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Totals */}
              <div className="space-y-2.5 border-t border-darkroom/10 px-6 py-5 text-sm">
                <Row label="Subtotal" value={formatCurrency(order.subtotal)} />
                <Row
                  label="Shipping"
                  value={
                    order.shipping === 0
                      ? "Free"
                      : formatCurrency(order.shipping)
                  }
                />
                {order.tax > 0 && (
                  <Row label="Taxes" value={formatCurrency(order.tax)} />
                )}
                <div className="my-3 h-px bg-darkroom/12" />
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-darkroom">Total</span>
                  <span className="text-2xl font-bold tabular-nums text-darkroom">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </section>

            {/* Right - address, payment, actions */}
            <aside className="space-y-6">
              <Card title="Shipping Address">
                <p className="text-sm font-semibold text-darkroom">
                  {order.customer.name}
                </p>
                <div className="mt-2 space-y-0.5 text-sm leading-relaxed text-darkroom/70">
                  {order.address.line1 && <p>{order.address.line1}</p>}
                  {order.address.line2 && <p>{order.address.line2}</p>}
                  <p>
                    {[order.address.city, order.address.state]
                      .filter(Boolean)
                      .join(", ")}
                    {order.address.postalCode
                      ? ` ${order.address.postalCode}`
                      : ""}
                  </p>
                  {order.address.country && <p>{order.address.country}</p>}
                </div>
                {order.customer.phone && (
                  <p className="mt-3 border-t border-darkroom/10 pt-3 text-xs text-darkroom/55">
                    {order.customer.phone}
                  </p>
                )}
              </Card>

              {(paymentId ?? order.paymentId) && (
                <Card title="Transaction ID">
                  <p className="break-all font-mono text-sm font-semibold text-darkroom">
                    {paymentId ?? order.paymentId}
                  </p>
                </Card>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/"
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-darkroom/15 bg-overexpose px-7 py-4 text-sm font-bold text-darkroom transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Home className="size-4" />
                  Go to home
                </Link>
                <button
                  type="button"
                  onClick={() => downloadInvoice(order)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-darkroom px-7 py-4 text-sm font-bold text-halide transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Download className="size-4" />
                  Download invoice
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- */

/** Builds a printable invoice and opens the browser print dialog (Save as PDF). */
function downloadInvoice(order: Order) {
  const shortId = order.orderId.replace(/^order_/, "").slice(-8).toUpperCase();
  const placed = order.placedAt
    ? new Date(order.placedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  const addressLines = [
    order.address.line1,
    order.address.line2,
    [order.address.city, order.address.state, order.address.postalCode]
      .filter(Boolean)
      .join(", "),
    order.address.country,
  ]
    .filter(Boolean)
    .map((l) => `<div>${escapeHtml(String(l))}</div>`)
    .join("");

  const rows = order.items
    .map(
      (it) => `
      <tr>
        <td>
          <div class="name">${escapeHtml(it.name)}</div>
          ${it.variant ? `<div class="muted">${escapeHtml(it.variant)}</div>` : ""}
        </td>
        <td class="num">${it.quantity}</td>
        <td class="num">${formatCurrency(it.price, order.currency)}</td>
        <td class="num">${formatCurrency(it.price * it.quantity, order.currency)}</td>
      </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>VHSMO Invoice ${shortId}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #1f1a18; margin: 0; padding: 48px; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; gap: 32px; border-bottom: 2px solid #1f1a18; padding-bottom: 24px; }
  .brand { max-width: 320px; }
  .logobox { display: inline-block; background: #1f1a18; border-radius: 10px; padding: 12px 16px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .logobox img { display: block; width: 130px; height: auto; }
  .seller { margin-top: 12px; }
  .seller .seller-name { font-size: 14px; font-weight: 700; color: #1f1a18; }
  .seller .muted { font-size: 12px; line-height: 1.6; color: #6b6360; margin-top: 4px; }
  .doc { text-align: right; }
  .doc h1 { margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; }
  .doc .muted { color: #6b6360; font-size: 13px; margin-top: 4px; }
  .cols { display: flex; gap: 48px; margin: 32px 0; }
  .col { flex: 1; }
  .col h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b6360; margin: 0 0 8px; }
  .col div { font-size: 14px; line-height: 1.5; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b6360; border-bottom: 1px solid #ddd; padding: 8px 0; }
  td { padding: 12px 0; border-bottom: 1px solid #eee; font-size: 14px; vertical-align: top; }
  .num { text-align: right; white-space: nowrap; }
  .name { font-weight: 600; }
  .muted { color: #6b6360; font-size: 12px; margin-top: 2px; }
  .totals { margin-top: 20px; margin-left: auto; width: 260px; }
  .totals .line { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
  .totals .grand { border-top: 2px solid #1f1a18; margin-top: 8px; padding-top: 12px; font-size: 18px; font-weight: 800; }
  .foot { margin-top: 48px; border-top: 1px solid #eee; padding-top: 16px; color: #6b6360; font-size: 12px; line-height: 1.6; }
  @media print { body { padding: 24px; } }
</style>
</head>
<body>
  <div class="top">
    <div class="brand">
      <div class="logobox"><img src="https://res.cloudinary.com/jyejt2p3/image/upload/v1784963870/Frame_58_jtqo1t.png" alt="VHSMO" /></div>
      <div class="seller">
        <div class="seller-name">VHSMO LLP</div>
        <div class="muted">
          H. No. 20, Nilaya Kapil, Aasmant Society,<br />
          S. No. 124/3/4, Armament, Sutarwadi,<br />
          Pune, Maharashtra &ndash; 411021, India
        </div>
        <div class="muted">GSTIN: 27ABBFV3675J1ZQ</div>
                <div class="muted"> LLPIN: ACT-8214</div>

        <div class="muted">team@vhsmo.com &middot; vhsmo.com</div>
      </div>
    </div>
    <div class="doc">
      <h1>Invoice</h1>
      <div class="muted">#${shortId}</div>
      <div class="muted">${placed}</div>
    </div>
  </div>

  <div class="cols">
    <div class="col">
      <h3>Billed to</h3>
      <div><strong>${escapeHtml(order.customer.name)}</strong></div>
      ${order.customer.email ? `<div>${escapeHtml(order.customer.email)}</div>` : ""}
      ${order.customer.phone ? `<div>${escapeHtml(order.customer.phone)}</div>` : ""}
    </div>
    <div class="col">
      <h3>Ship to</h3>
      <div><strong>${escapeHtml(order.customer.name)}</strong></div>
      ${addressLines}
    </div>
    <div class="col">
      <h3>Payment</h3>
      <div>Razorpay</div>
      <div class="muted">Order: ${escapeHtml(order.orderId)}</div>
      ${order.paymentId ? `<div class="muted">Payment: ${escapeHtml(order.paymentId)}</div>` : ""}
      <div style="margin-top:8px;color:#1a7f37;font-weight:600;">Paid</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th class="num">Qty</th>
        <th class="num">Price</th>
        <th class="num">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div class="line"><span>Subtotal</span><span>${formatCurrency(order.subtotal, order.currency)}</span></div>
    <div class="line"><span>Shipping</span><span>${order.shipping === 0 ? "Free" : formatCurrency(order.shipping, order.currency)}</span></div>
        <div class="line"><span>Taxes</span><span>${order.tax === 0 ? "Inclusive of all Taxes" : formatCurrency(order.tax, order.currency)}</span></div>

    <div class="line grand"><span>Total</span><span>${formatCurrency(order.total, order.currency)}</span></div>
  </div>

  <div class="foot">
    Thank you for your order. Your VHSMO is hand-assembled to order and ships within 5-6 weeks.
     Questions? team@vhsmo.com
  
  </div>

  <script>window.onload = function () { window.print(); };</script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function Notice({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Mail;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-darkroom/12 bg-overexpose p-5 shadow-[0_10px_40px_-24px_rgba(31,26,24,0.4)]">
      <span className="flex size-10 items-center justify-center rounded-full bg-kodak/50 text-darkroom">
        <Icon className="size-5" />
      </span>
      <p className="mt-3 text-sm font-bold text-darkroom">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-darkroom/60">{body}</p>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border-2 border-darkroom/12 bg-overexpose p-5 shadow-[0_10px_40px_-24px_rgba(31,26,24,0.4)]">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-darkroom/70">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-darkroom/60">{label}</span>
      <span className="tabular-nums text-darkroom">{value}</span>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="paper min-h-dvh" />}>
      <SuccessContent />
    </Suspense>
  );
}
