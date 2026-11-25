"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Download,
  Home,
  Loader2,
  Clock,
  Mail,
  Package,
  PackageX,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { variantAssets } from "@/lib/products";
import { displayOrderId } from "@/lib/order-id";
import { DELIVERY_ETA, DELIVERY_ETA_REMOTE, DISPATCH_ETA } from "@/lib/shipping";

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
  discount: number;
  couponCode: string | null;
  total: number;
  currency: string;
  paymentStatus: string;
  paymentMethod: "prepaid" | "cod";
  codFee: number;
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
    discount: Number(row.discount ?? 0),
    couponCode: row.coupon_code ?? null,
    total: Number(row.total ?? row.amount ?? 0),
    currency: row.currency ?? "INR",
    paymentStatus: String(row.payment_status ?? "pending").toLowerCase(),
    paymentMethod: row.payment_method === "cod" ? "cod" : "prepaid",
    codFee: Number(row.cod_fee ?? 0),
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

/**
 * The order row has no product photo (the checkout only stashes one in this
 * tab's sessionStorage), so a reopened link, another device or a private
 * window would show a blank box. Fall back to the finish's own front shot,
 * matched on the colour name the order stores ("Baby Pink", "Cherry Red",
 * "Cosmic Black").
 */
function imageForVariant(variant?: string): string | undefined {
  const v = (variant ?? "").toLowerCase();
  const sku = v.includes("pink")
    ? "VHSMO-BPK"
    : v.includes("red")
      ? "VHSMO-CHR"
      : v.includes("black")
        ? "VHSMO-BLK"
        : undefined;
  return sku ? variantAssets[sku]?.images[0]?.src : undefined;
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

  const shortId = displayOrderId(orderId ?? order?.orderId ?? "");

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
                ({displayOrderId(orderId)})
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

  // Payment never completed for this order - the row was created with only the
  // customer's name, email and shipping details, and payment_status is still
  // "pending". We don't offer a retry from the site; instead we ask the buyer
  // to reach out so we can help them complete the purchase.
  const isCod = order?.paymentMethod === "cod";
  const confirmed =
    order?.paymentStatus === "paid" ||
    (isCod && order?.paymentStatus === "cod_confirmed");

  if (order && !confirmed) {
    return (
      <div className="paper flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-full border-2 border-darkroom/15 bg-overexpose text-darkroom/60">
          <Clock className="size-8" />
        </span>

        <span className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-darkroom/12 bg-overexpose px-4 py-1.5 text-xs font-bold text-darkroom">
          <span className="flex size-2 rounded-full bg-darkroom/50" />
          Payment pending
        </span>

        <h1 className="display mt-6 text-[clamp(1.75rem,5vw,3rem)] text-darkroom">
          Your payment didn&apos;t go through
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-darkroom/60">
          We saved your order details
          {order.customer.email ? (
            <>
              {" "}
              for{" "}
              <span className="font-semibold text-darkroom">
                {order.customer.email}
              </span>
            </>
          ) : null}
          {shortId ? (
            <>
              {" "}
              <span className="font-mono text-sm font-semibold text-darkroom">
                (#{shortId})
              </span>
            </>
          ) : null}
          , but the payment wasn&apos;t completed. Get in touch and we&apos;ll
          help you finish your order.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={`mailto:team@vhsmo.com?subject=${encodeURIComponent(
              `Payment help for order ${displayOrderId(orderId ?? order.orderId)}`,
            )}`}
            className="flex items-center justify-center gap-2 rounded-full bg-darkroom px-7 py-4 text-sm font-bold text-halide transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Mail className="size-4" />
            Contact us
          </a>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-full border-2 border-darkroom/15 bg-overexpose px-7 py-4 text-sm font-bold text-darkroom transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="size-4" />
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const txnId = paymentId ?? order?.paymentId ?? "";

  return (
    <div className="paper min-h-dvh">
      <div className="container-px mx-auto w-full max-w-5xl pt-24 pb-14 sm:pt-28">
        {/* ---------- Statement ---------- */}
        <h1 className="display text-center text-[clamp(1.5rem,3.4vw,2.5rem)] uppercase leading-[1.1] text-darkroom">
          Thank you, your order has been{" "}
          <span className="font-marker mt-1 inline-block -rotate-2 bg-kodak px-2.5 leading-none shadow-[0.12rem_0.2rem_0_rgba(31,26,24,0.25)]">
            placed.
          </span>
        </h1>

        {/* ---------- Key facts ---------- */}
        <dl className="mt-6 grid divide-y divide-darkroom/15 rounded-xl border border-darkroom/15 bg-overexpose/50 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Fact label="Order number">
            <span className="break-all font-mono">#{shortId || "VHSMO"}</span>
          </Fact>
          <Fact label="Ships in">
            <Hl>{DISPATCH_ETA}</Hl>
            <span className="mt-0.5 block text-xs font-normal text-darkroom/50">
              Then {DELIVERY_ETA} to reach you
            </span>
          </Fact>
          <Fact label="Confirmation sent to">
            <span className="break-all">
              {order?.customer.email || "your email"}
            </span>
          </Fact>
        </dl>

        {isCod && order && (
          <p className="mt-3 rounded-xl bg-kodak/40 px-4 py-2.5 text-center text-sm font-semibold text-darkroom">
            Please keep {formatCurrency(order.total)} ready in cash or UPI for
            the delivery partner (includes {formatCurrency(order.codFee)} COD
            fee).
          </p>
        )}

        {order && (
          <>
            {/* ---------- Details ---------- */}
            <div className="mt-6 grid gap-x-10 gap-y-7 lg:grid-cols-3">
              <section className="border-t border-darkroom/15 pt-4">
                <ColTitle>Shipping address</ColTitle>
                <div className="space-y-0.5 text-sm leading-relaxed text-darkroom/70">
                  <p className="font-semibold text-darkroom">
                    {order.customer.name}
                  </p>
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
                  {order.customer.phone && <p>{order.customer.phone}</p>}
                </div>
                <p className="mt-3 text-xs text-darkroom/50">
                  Standard delivery · remote locations can take{" "}
                  {DELIVERY_ETA_REMOTE}
                </p>
              </section>

              <section className="border-t border-darkroom/15 pt-4">
                <ColTitle>Payment</ColTitle>
                <div className="space-y-0.5 text-sm leading-relaxed text-darkroom/70">
                  <p className="font-semibold text-darkroom">
                    {isCod ? "Cash on Delivery" : "Razorpay"}
                  </p>
                  <p>
                    {isCod
                      ? `${formatCurrency(order.total)} to be paid on delivery`
                      : "Paid"}
                  </p>
                </div>
                {!isCod && txnId && (
                  <div className="mt-3">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-darkroom/50">
                      Transaction ID
                    </p>
                    <p className="mt-0.5 break-all font-mono text-[13px] text-darkroom">
                      {txnId}
                    </p>
                  </div>
                )}
                <p className="mt-3 text-xs text-darkroom/50">
                  Billing address: same as shipping address
                </p>
              </section>

              <section className="border-t border-darkroom/15 pt-4">
                <ColTitle>Order summary</ColTitle>
                <ul className="divide-y divide-darkroom/10">
                  {order.items.map((item, i) => (
                    <li
                      key={`${item.id ?? i}-${item.variant ?? ""}`}
                      className="flex items-center gap-3 py-2.5 first:pt-0"
                    >
                      <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-bluehour bg-halide">
                        {(item.image ?? imageForVariant(item.variant)) ? (
                          <Image
                            src={(item.image ?? imageForVariant(item.variant))!}
                            alt={`${item.name}${item.variant ? ` in ${item.variant}` : ""}`}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <Package className="size-5 text-darkroom/35" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-darkroom">
                          {item.name}
                        </p>
                        <p className="truncate text-xs text-darkroom/55">
                          {[item.variant, `Qty ${item.quantity}`]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <span className="text-sm font-bold tabular-nums text-darkroom">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 space-y-1.5 border-t border-darkroom/10 pt-3 text-[13px]">
                  <Row
                    label="Subtotal"
                    value={formatCurrency(order.subtotal)}
                  />
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
                  {order.discount > 0 && (
                    <Row
                      label={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`}
                      value={`- ${formatCurrency(order.discount)}`}
                    />
                  )}
                  {isCod && order.codFee > 0 && (
                    <Row
                      label="Cash on Delivery fee"
                      value={formatCurrency(order.codFee)}
                    />
                  )}
                  <div className="flex items-center justify-between border-t border-darkroom/15 pt-2.5">
                    <span className="text-sm font-bold text-darkroom">
                      {isCod ? "Pay on delivery" : "Total"}
                    </span>
                    <span className="text-xl font-bold tabular-nums text-darkroom">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* ---------- Actions + help ---------- */}
            <div className="mt-7 flex flex-col-reverse items-center gap-4 border-t border-darkroom/15 pt-5 sm:flex-row sm:justify-between">
              <p className="max-w-xl text-center text-xs leading-relaxed text-darkroom/55 sm:text-left">
                Need help?{" "}
                <a
                  href={`mailto:team@vhsmo.com?subject=${encodeURIComponent(
                    `Help with order ${shortId}`,
                  )}`}
                  className="font-semibold text-darkroom underline decoration-kodak decoration-2 underline-offset-4"
                >
                  Contact us
                </a>
                . We&apos;ll email you when it&apos;s dispatched. Manufacturing
                defects are covered by our 12-month warranty.
              </p>
              <div className="flex w-full shrink-0 flex-col gap-2.5 sm:w-auto sm:flex-row">
                <button
                  type="button"
                  onClick={() => downloadInvoice(order)}
                  className="flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-darkroom px-6 py-3 text-sm font-bold text-halide transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Download className="size-4" />
                  Download invoice
                </button>
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 border-darkroom/20 px-6 py-3 text-sm font-bold text-darkroom transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Home className="size-4" />
                  Back to home
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- */

/** Builds a printable invoice and opens the browser print dialog (Save as PDF). */
function downloadInvoice(order: Order) {
  const shortId = displayOrderId(order.orderId);
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

  // Invoice values are GST-inclusive at 18% (intra-state). Break the total
  // into taxable value + GST so the invoice matches the GST breakdown table.
  const GST_RATE = 0.18;
  const isInr = (order.currency ?? "INR").toUpperCase() === "INR";
  const taxableValue = order.total / (1 + GST_RATE);
  const gstValue = order.total - taxableValue;

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
      <div>${order.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay"}</div>
      <div class="muted">Order: ${escapeHtml(shortId)}</div>
      ${order.paymentId ? `<div class="muted">Payment: ${escapeHtml(order.paymentId)}</div>` : ""}
      ${
        order.paymentMethod === "cod"
          ? `<div style="margin-top:8px;color:#9a6700;font-weight:600;">To be collected on delivery</div>`
          : `<div style="margin-top:8px;color:#1a7f37;font-weight:600;">Paid</div>`
      }
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
    ${
      order.discount > 0
        ? `<div class="line"><span>Discount${order.couponCode ? ` (${escapeHtml(order.couponCode)})` : ""}</span><span>&minus;${formatCurrency(order.discount, order.currency)}</span></div>`
        : ""
    }
    <div class="line"><span>Shipping</span><span>${order.shipping === 0 ? "Free" : formatCurrency(order.shipping, order.currency)}</span></div>
    ${
      order.codFee > 0
        ? `<div class="line"><span>COD fee</span><span>${formatCurrency(order.codFee, order.currency)}</span></div>`
        : ""
    }
    ${
      isInr
        ? `<div class="line"><span>Taxable value</span><span>${formatCurrency(taxableValue, order.currency)}</span></div>
    <div class="line"><span>GST (18%)</span><span>${formatCurrency(gstValue, order.currency)}</span></div>`
        : `<div class="line"><span>Taxes</span><span>${order.tax === 0 ? "Inclusive of all Taxes" : formatCurrency(order.tax, order.currency)}</span></div>`
    }

    <div class="line grand"><span>Total</span><span>${formatCurrency(order.total, order.currency)}</span></div>
  </div>

  <div class="foot">
    Thank you for your order. Your VHSMO should reach you within ${DELIVERY_ETA}, depending on your address.
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

/** Kodak-underlined emphasis for dates and the email address. */
function Hl({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-semibold text-darkroom underline decoration-kodak decoration-2 underline-offset-4">
      {children}
    </span>
  );
}

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-darkroom">
      {children}
    </h2>
  );
}

function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 py-3.5 text-center sm:text-left">
      <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-darkroom/50">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-darkroom">{children}</dd>
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
