import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Clock,
  Headphones,
  Info,
  Loader2,
  Lock,
  PackageX,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import { track } from "@vercel/analytics";
import { formatCurrency } from "@/lib/utils";
import { loadRazorpay } from "@/lib/load-razorpay";
import { buildContents, pixel } from "@/lib/meta-pixel";
import type { CartItem } from "@/lib/cart-context";
import type { Address } from "@/components/address/types";
import { COD_FEE_DISPLAY } from "@/lib/cod/fee";
import { CouponInput } from "./CouponInput";
import {
  PaymentMethodSelect,
  type CodAvailability,
  type PaymentChoice,
} from "./PaymentMethodSelect";

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type OrderSummaryProps = {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  /** True when every field is valid. */
  canCheckout: boolean;
  /** Reveals validation errors and reports whether checkout may proceed. */
  onAttemptCheckout: () => boolean;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  address: Address;
  /** Cart-line product ids whose live backend stock is 0 - checkout is blocked
   *  until they're removed from the cart. */
  soldOutIds: Set<string>;
  /** Whether Cash on Delivery can be offered; null hides the option entirely. */
  cod: CodAvailability | null;
  /** Email ownership proven (both payment methods require it). */
  emailVerified: boolean;
  /** Signed token from the emailed code; sent with the order. */
  emailToken: string | null;
  /** Pay pressed before verifying: scroll to the email field and send a code. */
  onRequireVerification: () => void;
  /** The server rejected the token (expired / already used). */
  onTokenRejected: (message?: string) => void;
  /** Fired once order creation begins - used to pause the reservation timer. */
  onOrderStart?: () => void;
  /** Fired if the shopper backs out (dismisses Razorpay / order fails). */
  onOrderCancelled?: () => void;
  onSuccess: () => void;
};

export function OrderSummary({
  items,
  subtotal,
  shipping,
  tax,
  total,
  canCheckout,
  onAttemptCheckout,
  customer,
  address,
  soldOutIds,
  cod,
  emailVerified,
  emailToken,
  onRequireVerification,
  onTokenRejected,
  onOrderStart,
  onOrderCancelled,
  onSuccess,
}: OrderSummaryProps) {
  const hasSoldOut = soldOutIds.size > 0;
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState<PaymentChoice>("prepaid");
  const [codError, setCodError] = useState("");
  const isCod = method === "cod";
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coupon, setCoupon] = useState<{
    code: string;
    discount: number;
    expiresAt: string | null;
  } | null>(null);

  const [couponLoading, setCouponLoading] = useState(false);

  const [couponError, setCouponError] = useState("");

  // Fetch the payment script while the shopper fills in the form.
  useEffect(() => {
    loadRazorpay().catch(() => {});
  }, []);

  // If COD stops being available (PIN changed), fall back to online payment.
  useEffect(() => {
    if (isCod && !cod?.available) setMethod("prepaid");
  }, [isCod, cod]);

  const chooseMethod = (next: PaymentChoice) => {
    if (next === method) return;
    setCodError("");
    if (next === "cod") {
      track("cod_selected", { source: "checkout" });
    }
    setMethod(next);
  };

  const handleCheckout = async () => {
    if (processing) return;

    // A cart line that's out of stock on the backend can't be ordered - the
    // shopper has to drop it before we hit Razorpay.
    if (hasSoldOut) return;

    // Reveal any outstanding validation errors before touching Razorpay.
    if (!onAttemptCheckout()) {
      // Scroll the first error into view for the user.
      buttonRef.current
        ?.closest("form")
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Both payment methods need a verified email. If it isn't yet, take the
    // shopper to the field and send the code in one step.
    if (!emailVerified || !emailToken) {
      onRequireVerification();
      return;
    }

    // Meta Pixel: details are valid and verified - the shopper is moving on to pay.
    pixel(
      "AddPaymentInfo",
      buildContents(
        items,
        total - (coupon?.discount ?? 0) + (isCod ? COD_FEE_DISPLAY : 0),
      ),
    );

    if (isCod) {
      setCodError("");
      await placeCodOrder(emailToken);
      return;
    }

    setProcessing(true);
    // Freeze the reservation countdown - the shopper is committing to pay and
    // must not be bounced home while Razorpay is open.
    onOrderStart?.();

    const firstName = customer.firstName.trim();
    const lastName = customer.lastName.trim();
    const fullName = `${firstName} ${lastName}`.trim();
    const shippingInfo = {
      address1: address.street,
      address2: address.apartment,
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode,
    };

    try {
      const res = await fetch("/api/createOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send only what the backend trusts. Pricing (amount, subtotal,
        // shipping, tax, total, discount) is computed server-side, so there is
        // nothing for DevTools to tamper with here.
        body: JSON.stringify({
          customer: {
            name: fullName,
            email: customer.email,
            phone: customer.phone,
          },
          shipping: shippingInfo,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          couponCode: coupon?.code ?? null,
          otpToken: emailToken,
        }),
      });

      if (res.status === 401) {
        // Verification expired or doesn't match this email - ask again.
        const data = await res.json().catch(() => ({}));
        setProcessing(false);
        onOrderCancelled?.();
        onTokenRejected(data.message);
        return;
      }
      if (!res.ok) throw new Error("Failed to create order");
track("pay_securely_clicked", {
      source: "checkout",
      total,
      ready: canCheckout,
    });
      const order = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "VHSMO",
        description: "VHSMO Camera",
        order_id: order.id,
        prefill: {
          name: fullName,
          email: customer.email,
          contact: customer.phone,
        },
        theme: { color: "#2A2422" },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            // Shopper closed Razorpay without paying - resume the countdown.
            onOrderCancelled?.();
          },
        },
        handler: async function (response: RazorpayResponse) {
          try {
            // Only the payment response is sent. The backend reads the order
            // (customer, items, pricing, coupon) from Supabase - the browser
            // has no say in any of it after payment.
            const verifyRes = await fetch("/api/verifyPayment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                payment: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
              }),
            });

            const result = await verifyRes.json();

            if (verifyRes.ok && result.success) {
              // Stash the order so the confirmation page can render the full
              // receipt (items, address, totals) without a round-trip.
              try {
                sessionStorage.setItem(
                  "vhsmo:lastOrder",
                  JSON.stringify({
                    orderId: response.razorpay_order_id,
                    paymentId: response.razorpay_payment_id,
                    placedAt: Date.now(),
                    customer: {
                      name: fullName,
                      email: customer.email,
                      phone: customer.phone,
                    },
                    address: shippingInfo,
                    items: items.map((item) => ({
                      id: item.id,
                      name: item.name,
                      variant: item.variant,
                      quantity: item.quantity,
                      price: item.price,
                      image: item.image,
                    })),
                    subtotal,
                    shipping,
                    tax,
                    discount: coupon?.discount ?? 0,
                    couponCode: coupon?.code ?? null,
                    total: finalTotal,
                                    }),
                );
              } catch {
                // sessionStorage unavailable - page falls back to IDs only.
              }

              onSuccess();
              router.push(
                `/checkout/success?order=${encodeURIComponent(
                  response.razorpay_order_id,
                )}&payment=${encodeURIComponent(response.razorpay_payment_id)}`,
              );
            }
          } catch (err) {
            console.error(err);
          }
        },
      };

      await loadRazorpay();
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error(err);
      setProcessing(false);
      // Order never got off the ground - resume the countdown.
      onOrderCancelled?.();
    }
  };

  /** Places the COD order once the email is verified. */
  const placeCodOrder = async (otpToken: string) => {
    setProcessing(true);
    onOrderStart?.();

    const fullName = `${customer.firstName.trim()} ${customer.lastName.trim()}`.trim();
    const shippingInfo = {
      address1: address.street,
      address2: address.apartment,
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode,
    };

    try {
      const res = await fetch("/api/createOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: "cod",
          otpToken,
          couponCode: coupon?.code ?? null,
          customer: { name: fullName, email: customer.email, phone: customer.phone },
          shipping: shippingInfo,
          items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.id) {
        setProcessing(false);
        onOrderCancelled?.();
        if (res.status === 401) {
          onTokenRejected(data.message);
          return;
        }
        setCodError(data.message ?? "We couldn't place your order. Please try again.");
        return;
      }

      track("cod_order_placed", { source: "checkout", total: data.total });
      try {
        sessionStorage.setItem(
          "vhsmo:lastOrder",
          JSON.stringify({
            orderId: data.id,
            paymentId: "",
            paymentMethod: "cod",
            placedAt: Date.now(),
            customer: { name: fullName, email: customer.email, phone: customer.phone },
            address: shippingInfo,
            items: items.map((item) => ({
              id: item.id,
              name: item.name,
              variant: item.variant,
              quantity: item.quantity,
              price: item.price,
              image: item.image,
            })),
            subtotal,
            shipping,
            tax,
            discount: coupon?.discount ?? 0,
            couponCode: coupon?.code ?? null,
            codFee: data.codFee,
            total: data.total,
          }),
        );
      } catch {
        // sessionStorage unavailable - page falls back to the API.
      }

      onSuccess();
      router.push(`/checkout/success?order=${encodeURIComponent(data.id)}&method=cod`);
    } catch (err) {
      console.error(err);
      setCodError("We couldn't place your order. Please try again.");
      setProcessing(false);
      onOrderCancelled?.();
    }
  };

  const applyCoupon = async (code: string) => {
    // Require a valid email before any coupon can be applied - coupons are
    // tied to the shopper's email, so we can't validate one without it.
    const email = customer.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setCoupon(null);
      setCouponError("Enter your email above before applying a coupon.");
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError("");

      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          subtotal,
          email: customer.email,
        }),
      });

      const data = await res.json();

      if (!data.valid) {
        setCoupon(null);
        setCouponError(data.message);
        return;
      }

      setCoupon({
        code: data.code,
        discount: data.discount,
        expiresAt: data.expiresAt ?? null,
      });
    } finally {
      setCouponLoading(false);
    }
  };
  // Display only - the server recomputes every rupee.
  const discount = coupon?.discount ?? 0;
  const codTotal = total - discount + COD_FEE_DISPLAY;
  const finalTotal = isCod ? codTotal : total - discount;

  return (
    <aside className="space-y-4 lg:sticky lg:top-8 lg:h-fit">
      <div className="rounded-2xl border-2 border-darkroom/12 bg-overexpose p-6 shadow-[0_10px_40px_-24px_rgba(31,26,24,0.4)]">
        <h2 className="text-lg font-bold text-darkroom">Order summary</h2>
        {/* Items */}
        <ul className="mt-4 divide-y divide-darkroom/10 border-y border-darkroom/10">
          {items.map((item) => {
            const soldOut = soldOutIds.has(item.id);
            return (
            <li
              key={`${item.id}-${item.variant ?? ""}`}
              className="flex gap-3.5 py-4"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-halide">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className={`object-cover transition ${
                    soldOut ? "opacity-40 grayscale" : ""
                  }`}
                />
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <p className="text-sm font-semibold leading-snug text-darkroom">
                  {item.name}
                </p>
                {item.variant && (
                  <p className="text-xs text-darkroom/55">{item.variant}</p>
                )}
                <p className="text-xs text-darkroom/45">Qty: {item.quantity}</p>
                {soldOut && (
                  <span className="mt-1.5 inline-flex w-fit items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] sm:text-[10px] font-bold uppercase tracking-wider text-red-600 ring-1 ring-inset ring-red-500/25">
                    <PackageX className="size-3" />
                    Out of stock
                  </span>
                )}
              </div>
              <span
                className={`self-center text-sm font-semibold tabular-nums ${
                  soldOut ? "text-darkroom/40" : "text-darkroom"
                }`}
              >
                {formatCurrency(item.price * item.quantity)}
              </span>
            </li>
            );
          })}
        </ul>
        {coupon ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border-2 border-green-600/25 bg-green-600/[0.06] p-3.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-green-600/15 text-green-700">
              <BadgeCheck className="size-5" />
            </span>
            <div className="flex-1 leading-tight">
              <p className="text-sm font-bold text-darkroom">
                {coupon.code} applied
              </p>
              <p className="text-xs text-darkroom/55">
                You saved {formatCurrency(coupon.discount)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCoupon(null);
                setCouponError("");
              }}
              aria-label="Remove coupon"
              className="tap-target flex size-8 shrink-0 items-center justify-center rounded-full text-darkroom/45 transition-colors hover:bg-darkroom/[0.06] hover:text-darkroom/70"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <CouponInput
            loading={couponLoading}
            onApply={applyCoupon}
            error={couponError}
          />
        )}
        {coupon && (
          <CouponCountdown expiresAt={coupon.expiresAt} />
        )}
        {/* Totals */}
        <div className="space-y-2.5 pt-4 text-sm">
          <Row label="Subtotal" value={formatCurrency(subtotal)} />

          {coupon && (
            <Row
              label={`Coupon (${coupon.code})`}
              value={`- ${formatCurrency(coupon.discount)}`}
            />
          )}
          <Row
            label="Shipping"
            value={shipping === 0 ? "Free" : formatCurrency(shipping)}
          />
          {isCod && (
            <Row
              label="Cash on Delivery fee"
              value={formatCurrency(COD_FEE_DISPLAY)}
            />
          )}
          <div className="my-3 h-px bg-darkroom/12" />
          <div className="flex items-end justify-between text-darkroom">
            <div>
              <span className="text-base font-bold">
                {isCod ? "Pay on delivery" : "Total"}
              </span>
              <p className="text-xs font-normal text-darkroom/50">
                {isCod
                  ? `Includes ${formatCurrency(COD_FEE_DISPLAY)} COD fee. Inclusive of all taxes.`
                  : "Inclusive of all taxes."}
              </p>
            </div>
            <span className="text-2xl font-bold tabular-nums">
              {formatCurrency(finalTotal)}
            </span>
          </div>
        </div>
        {/* Out-of-stock notice - blocks checkout until the item is removed. */}
        {hasSoldOut && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-xl border-2 border-red-500/30 bg-red-500/[0.06] p-3.5 text-red-700"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-500/15">
              <PackageX className="size-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-red-700">
                Item out of stock
              </p>
              <p className="mt-0.5 text-xs font-medium text-red-700/80">
                Remove the flagged item from your cart to place your order.
              </p>
            </div>
          </div>
        )}
        {/* Payment method */}
        {cod && (
          <PaymentMethodSelect
            value={method}
            onChange={chooseMethod}
            cod={cod}
            codTotal={codTotal}
            disabled={processing}
          />
        )}
        {codError && (
          <p
            role="alert"
            className="mt-3 rounded-xl border-2 border-red-500/30 bg-red-500/[0.06] p-3 text-xs font-semibold text-red-700"
          >
            {codError}
          </p>
        )}
        {/* Accuracy notice */}
        <p className="mt-5 flex items-start gap-2 rounded-xl bg-darkroom/[0.05] p-3 text-xs leading-relaxed text-darkroom/65">
          <Info className="mt-0.5 size-3.5 shrink-0 text-darkroom/50" />
          <span>
            Please double-check your contact details and shipping address before
            placing your order. VHSMO is not responsible for delays, missed
            communications or failed deliveries resulting from incorrect or
            incomplete information provided by you, subject to applicable law.
          </span>
        </p>
        {/* Checkout button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={handleCheckout}
          disabled={processing || hasSoldOut}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-bold tracking-tight transition-all duration-300 ease-[var(--ease-out-expo)] disabled:cursor-not-allowed ${
            hasSoldOut
              ? "bg-darkroom/15 text-darkroom/45"
              : "bg-bluehour text-overexpose hover:shadow-[0_0_0_5px_rgba(16,147,255,0.25)] active:scale-[0.98] disabled:opacity-60 disabled:shadow-none disabled:hover:shadow-none disabled:active:scale-100"
          }`}
        >
          {processing ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Processing…
            </>
          ) : hasSoldOut ? (
            "Item unavailable"
          ) : canCheckout && !emailVerified ? (
            <>
              <ShieldCheck className="size-4" />
              Verify email to continue
            </>
          ) : isCod ? (
            <>
              <Truck className="size-4" />
              {canCheckout
                ? `Place COD order · ${formatCurrency(finalTotal)}`
                : "Continue"}
            </>
          ) : (
            <>
              <Lock className="size-4" />
              {canCheckout ? "Pay securely" : "Continue"}
            </>
          )}
        </button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-darkroom/55">
          <Lock className="size-3.5" /> Encrypted &amp; secure. Your data is
          safe with us.
        </p>
        {/* Secure & Safe banner */}
        <div className="mt-5 flex items-start gap-3 rounded-xl bg-bluehour/[0.08] p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-bluehour" />
          <div>
            <p className="text-sm font-bold text-darkroom">Secure &amp; Safe</p>
            <p className="mt-0.5 text-xs leading-relaxed text-darkroom/60">
              Your data is protected with 256-bit encryption. Powered by
              Razorpay.
            </p>
          </div>
        </div>
      </div>

      {/* Need help card */}
      <div className="flex items-center gap-3.5 rounded-2xl border-2 border-darkroom/12 bg-overexpose p-5 shadow-[0_10px_40px_-24px_rgba(31,26,24,0.4)]">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-kodak/50 text-darkroom">
          <Headphones className="size-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-darkroom">Need help?</p>
          <p className="text-xs text-darkroom/55">We&apos;re here for you.</p>
          <a
            href="mailto:team@vhsmo.com"
            className="text-xs font-semibold text-bluehour hover:underline"
          >
            team@vhsmo.com
          </a>
        </div>
      </div>
    </aside>
  );
}

/**
 * Live warning banner that ticks down to a coupon's `expires_at`, one second at
 * a time. Renders nothing when there is no expiry, the date is unparseable, or
 * the offer has already lapsed.
 */
function CouponCountdown({ expiresAt }: { expiresAt: string | null }) {
  const expiryMs = expiresAt ? new Date(expiresAt).getTime() : NaN;
  const valid = !Number.isNaN(expiryMs);

  // Re-render every second while the offer is still live.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!valid) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [valid, expiryMs]);

  if (!valid) return null;

  const remaining = expiryMs - now;
  if (remaining <= 0) return null;
  // Only nudge on genuinely near-term expiries - no timer for coupons that
  // have more than 10 days left to run.
  if (remaining > 10 * 86400 * 1000) return null;

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  const clock =
    days > 0
      ? `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return (
    <div
      role="status"
      aria-live="off"
      className="mt-3 flex items-center gap-2.5 rounded-xl border-2 border-amber-500/30 bg-amber-500/[0.08] p-3 text-amber-900"
    >
      <Clock className="size-4 shrink-0 text-amber-600" />
      <p className="text-xs font-semibold leading-tight">
        Hurry — this coupon expires in{" "}
        <span className="font-bold tabular-nums">{clock}</span>
      </p>
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
