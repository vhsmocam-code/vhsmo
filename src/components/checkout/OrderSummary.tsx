import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Headphones, Loader2, Lock, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/lib/cart-context";
import type { Address } from "@/components/address/types";
import type { EmailStatus } from "./useEmailVerification";

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type OrderSummaryProps = {
  items: CartItem[];
  count: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  emailStatus: EmailStatus;
  /** True when every field is valid and the email is verified. */
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
  onSuccess: () => void;
};

export function OrderSummary({
  items,
  count,
  subtotal,
  shipping,
  tax,
  total,
  emailStatus,
  canCheckout,
  onAttemptCheckout,
  customer,
  address,
  onSuccess,
}: OrderSummaryProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // One VHSMO per order - a cart with more than a single unit (extra
  // quantity or a second finish) can't be paid for.
  const singleUnit = count === 1;

  const handleCheckout = async () => {
    if (processing || !singleUnit) return;
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
        body: JSON.stringify({
          amount: Math.round(total * 100),

          customer: {
            name: fullName,
            email: customer.email,
            phone: customer.phone,
          },

          shipping: shippingInfo,

          items: items.map((item) => ({
            productId: item.id,
            name: item.name,
            variant: item.variant,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          })),

          subtotal,
          shippingCost: shipping,
          tax,
          total,
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
        modal: { ondismiss: () => setProcessing(false) },
        handler: async function (response: RazorpayResponse) {
          try {
            const verifyRes = await fetch("/api/verifyPayment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                payment: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
                customer: {
                  name: fullName,
                  email: customer.email,
                  phone: customer.phone,
                },
                shipping: shippingInfo,
                items: items.map((item) => ({
                  productId: item.id,
                  name: item.name,
                  variant: item.variant,
                  quantity: item.quantity,
                  price: item.price,
                  total: item.price * item.quantity,
                })),
                subtotal,
                shippingCost: shipping,
                tax,
                total,
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
                    total: subtotal + shipping + tax,
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
    }
  };

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

        {/* Totals */}
        <div className="space-y-2.5 pt-4 text-sm">
          <Row label="Subtotal" value={formatCurrency(subtotal)} />
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
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* One-unit guard - explains why checkout is blocked before the
            button, so the disabled state isn't a dead end. */}
        {!singleUnit && (
          <p className="mt-5 rounded-xl border-l-2 border-kodak bg-kodak/10 px-4 py-3 text-sm text-darkroom/80">
            Early access is limited to 1 VHSMO per order. Remove extra items to continue.
          </p>
        )}

        {/* Checkout button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={handleCheckout}
          disabled={processing || emailStatus !== "verified" || !singleUnit}
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
              {!singleUnit
                ? "One unit per order"
                : canCheckout
                  ? "Pay securely"
                  : emailStatus === "verified"
                    ? "Continue"
                    : "Verify email & continue"}
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-darkroom/60">{label}</span>
      <span className="tabular-nums text-darkroom">{value}</span>
    </div>
  );
}
