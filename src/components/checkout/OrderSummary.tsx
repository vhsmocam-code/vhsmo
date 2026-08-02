import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Headphones,
  Info,
  Loader2,
  Lock,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import { track } from "@vercel/analytics";
import { formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/lib/cart-context";
import type { Address } from "@/components/address/types";
import { CouponInput } from "./CouponInput";

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
  onOrderStart,
  onOrderCancelled,
  onSuccess,
}: OrderSummaryProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [showCodInfo, setShowCodInfo] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coupon, setCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  const [couponLoading, setCouponLoading] = useState(false);

  const [couponError, setCouponError] = useState("");

  const handleCheckout = async () => {
    if (processing) return;
    track("pay_securely_clicked", {
      source: "checkout",
      total,
      ready: canCheckout,
    });
    // Reveal any outstanding validation errors before touching Razorpay.
    if (!onAttemptCheckout()) {
      // Scroll the first error into view for the user.
      buttonRef.current
        ?.closest("form")
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
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
        }),
      });

      if (!res.ok) throw new Error("Failed to create order");

      const order = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "VHSMO",
        description: "VHSMO Camera Preorder",
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

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error(err);
      setProcessing(false);
      // Order never got off the ground - resume the countdown.
      onOrderCancelled?.();
    }
  };

  const applyCoupon = async (code: string) => {
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
      });
    } finally {
      setCouponLoading(false);
    }
  };
  const finalTotal = total - (coupon?.discount ?? 0);

  return (
    <aside className="space-y-4 lg:sticky lg:top-8 lg:h-fit">
      <div className="rounded-2xl border-2 border-darkroom/12 bg-overexpose p-6 shadow-[0_10px_40px_-24px_rgba(31,26,24,0.4)]">
        <h2 className="text-lg font-bold text-darkroom">Order summary</h2>
        {/* Items */}
        <ul className="mt-4 divide-y divide-darkroom/10 border-y border-darkroom/10">
          {items.map((item) => (
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
                  className="object-cover"
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
              </div>
              <span className="self-center text-sm font-semibold tabular-nums text-darkroom">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </li>
          ))}
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
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-darkroom/45 transition-colors hover:bg-darkroom/[0.06] hover:text-darkroom/70"
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
          <div className="my-3 h-px bg-darkroom/12" />
          <div className="flex items-end justify-between text-darkroom">
            <div>
              <span className="text-base font-bold">Total</span>
              <p className="text-xs font-normal text-darkroom/50">
                Inclusive of all taxes.
              </p>
            </div>
            <span className="text-2xl font-bold tabular-nums">
              {formatCurrency(finalTotal)}
            </span>
          </div>
        </div>
        {/* Checkout button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={handleCheckout}
          disabled={processing}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-bluehour px-8 py-4 text-base font-bold tracking-tight text-overexpose transition-all duration-300 ease-[var(--ease-out-expo)] hover:shadow-[0_0_0_5px_rgba(16,147,255,0.25)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:hover:shadow-none disabled:active:scale-100"
        >
          {processing ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <Lock className="size-4" />
              {canCheckout ? "Pay securely" : "Continue"}
            </>
          )}
        </button>
        {/* Cash on Delivery - currently unavailable (whole row opens modal) */}
        <button
          type="button"
          onClick={() => {
            track("cod_clicked", { source: "checkout" });
            setShowCodInfo(true);
          }}
          aria-haspopup="dialog"
          aria-expanded={showCodInfo}
          aria-label="Why is Cash on Delivery unavailable?"
          className="mt-2 flex w-full items-center gap-3 rounded-full border border-darkroom/12 bg-darkroom/[0.03] px-4 py-2.5 text-left transition-colors hover:bg-darkroom/[0.06]"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-darkroom/[0.06] text-darkroom/40">
            <Truck className="size-4" />
          </span>
          <span className="flex-1 leading-tight">
            <span className="block text-sm font-bold text-darkroom/70">
              Cash on Delivery
            </span>
            <span className="block text-xs text-darkroom/45">
              Currently unavailable
            </span>
          </span>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-darkroom/12 text-darkroom/45">
            <Info className="size-4" />
          </span>
        </button>
        {/* Cash on Delivery explainer modal */}
        {showCodInfo && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cod-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <button
              type="button"
              aria-label="Close"
              onClick={() => setShowCodInfo(false)}
              className="absolute inset-0 cursor-default bg-darkroom/60 backdrop-blur-sm"
            />
            {/* Panel */}
            <div className="relative w-full max-w-md rounded-2xl border border-darkroom/10 bg-overexpose p-6 shadow-[0_30px_80px_-24px_rgba(31,26,24,0.6)]">
              <button
                type="button"
                onClick={() => setShowCodInfo(false)}
                aria-label="Close"
                className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-darkroom/45 transition-colors hover:bg-darkroom/[0.06] hover:text-darkroom/70"
              >
                <X className="size-4" />
              </button>

              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-darkroom/[0.06] text-darkroom/50">
                  <Truck className="size-5" />
                </span>
                <div>
                  <h3
                    id="cod-modal-title"
                    className="text-base font-bold text-darkroom"
                  >
                    Why Cash on Delivery isn&apos;t available
                  </h3>
                  <p className="text-xs text-darkroom/50">
                    A quick note for our early supporters
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3.5 text-sm leading-relaxed text-darkroom/70">
                <p>
                  VHSMO is currently in its first production run, which means we
                  aren&apos;t shipping from existing inventory in a warehouse.
                  Every pre-order helps fund manufacturing, quality checks,
                  certifications, and getting your camera ready to ship.
                </p>
                <p>
                  As a thank you to all our early supporters, we wanted to
                  justify the wait. We&apos;re offering the exclusive pre-order
                  price of{" "}
                  <span className="font-bold text-darkroom">₹5,999</span> while
                  first-batch stock lasts. Once pre-orders end, VHSMO will
                  return to its regular retail price of{" "}
                  <span className="font-semibold text-darkroom">₹6,999</span>.
                </p>
              </div>

              {/* Refund guarantee */}
              <div className="mt-4 flex items-start gap-3 rounded-xl bg-bluehour/[0.08] p-4">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-bluehour" />
                <p className="text-sm leading-relaxed text-darkroom/75">
                  <span className="font-bold text-darkroom">
                    No risk attached.
                  </span>{" "}
                  If your order isn&apos;t shipped by{" "}
                  <span className="font-semibold text-darkroom">
                    15 September 2026
                  </span>
                  , you&apos;re eligible for a full refund - no questions asked.
                </p>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    track("cod_back_to_home_clicked", { source: "checkout" });
                    router.push("/");
                  }}
                  className="flex-1 rounded-full border border-darkroom/15 px-6 py-3 text-sm font-bold tracking-tight text-darkroom/70 transition-colors hover:bg-darkroom/[0.06]"
                >
                  Back to home
                </button>
                <button
                  type="button"
                  onClick={() => {
                    track("cod_got_it_clicked", { source: "checkout" });
                    setShowCodInfo(false);
                  }}
                  className="flex-1 rounded-full bg-bluehour px-6 py-3 text-sm font-bold tracking-tight text-overexpose transition-all duration-300 ease-[var(--ease-out-expo)] hover:shadow-[0_0_0_5px_rgba(16,147,255,0.25)] active:scale-[0.98]"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-darkroom/60">{label}</span>
      <span className="tabular-nums text-darkroom">{value}</span>
    </div>
  );
}
