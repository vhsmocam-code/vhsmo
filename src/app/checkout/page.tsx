"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useProducts } from "@/lib/products-context";
import { usePersistedState } from "@/components/checkout/usePersistedState";
import { emptyAddress, type Address } from "@/components/address/types";
import {
  CHECKOUT_FIELDS,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutField,
} from "@/lib/checkout-validation";
import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { CheckoutFooter } from "@/components/checkout/CheckoutFooter";
import { ContactSection } from "@/components/checkout/ContactSection";
import { EmptyCart } from "@/components/checkout/EmptyCart";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { ShippingSection } from "@/components/checkout/ShippingSection";
import { DeliveryBanner } from "@/components/checkout/DeliveryBanner";
import { useEmailVerification } from "@/components/checkout/useEmailVerification";
import { usePincodeServiceability } from "@/components/checkout/usePincodeServiceability";
import { useCheckoutReservation } from "@/components/checkout/useCheckoutReservation";
import { ReservationBanner } from "@/components/checkout/ReservationBanner";

export default function CheckoutPage() {
  const { items, subtotal, shipping, tax, isHydrated, clear } = useCart();

  // Live Supabase stock, keyed by product row id. A cart line whose backend
  // stock is 0 (or the row is gone) can't be checked out - the order summary
  // flags it and the pay button is blocked until it's removed.
  const products = useProducts();
  const soldOutIds = useMemo(() => {
    const stockById = new Map(products.map((p) => [p.id, p.stock]));
    const out = new Set<string>();
    for (const item of items) {
      const stock = stockById.get(item.id);
      if (stock !== undefined && stock <= 0) out.add(item.id);
    }
    return out;
  }, [products, items]);
  const hasSoldOut = soldOutIds.size > 0;

  // Static 10-minute "reservation" countdown to nudge the shopper along. It
  // runs while the cart has items and redirects home if it lapses; `stop()`
  // freezes it the moment an order is created. Suppressed while a line is out
  // of stock - there's nothing to reserve, and the redirect would be perverse.
  const reservation = useCheckoutReservation(
    isHydrated && items.length > 0 && !hasSoldOut,
  );

  // Checkout is open to everyone. Email is validated for format only.
  const { email, setEmail } = useEmailVerification();

  const [firstName, setFirstName] = usePersistedState("checkout:firstName", "");
  const [lastName, setLastName] = usePersistedState("checkout:lastName", "");
  const [phone, setPhone] = usePersistedState("checkout:phone", "");

  // Shipping address - entered manually, every field editable.
  const [address, setAddress] = usePersistedState<Address>(
    "checkout:address",
    emptyAddress,
  );
  const patchAddress = (patch: Partial<Address>) =>
    setAddress((a) => ({ ...a, ...patch }));

  // Live Delhivery serviceability for the entered PIN code.
  const { status: pincodeStatus, info: pincodeInfo } = usePincodeServiceability(
    address.postalCode,
  );

  // Validation - a field's error only shows once it's been touched or the
  // user has attempted checkout.
  const [touched, setTouched] = useState<Set<CheckoutField>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const values = useMemo(
    () => ({ email, phone, firstName, lastName, address }),
    [email, phone, firstName, lastName, address],
  );
  const errors = useMemo(() => validateCheckout(values), [values]);

  const visibleErrors = useMemo<CheckoutErrors>(() => {
    const out: CheckoutErrors = {};
    for (const field of CHECKOUT_FIELDS) {
      if ((submitted || touched.has(field)) && errors[field]) {
        out[field] = errors[field];
      }
    }
    return out;
  }, [errors, touched, submitted]);

  const handleBlur = (field: CheckoutField) =>
    setTouched((t) => new Set(t).add(field));

  // A PIN Delhivery has explicitly rejected blocks checkout; a check that's
  // still pending or errored out falls back to the format validation alone.
  const canCheckout =
    Object.keys(errors).length === 0 &&
    pincodeStatus !== "unserviceable" &&
    !hasSoldOut;

  /** Called by the checkout button. Reveals errors and reports readiness. */
  const attemptCheckout = () => {
    setSubmitted(true);
    return canCheckout;
  };

  // The form only guards against accidental Enter-key submits.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  // On a completed order, empty the cart and wipe the persisted draft so the
  // next visit starts clean.
  const handleSuccess = () => {
    reservation.stop();
    clear();
    setEmail("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setAddress(emptyAddress);
  };

  if (isHydrated && items.length === 0) {
    return (
      <div className="paper flex min-h-dvh flex-col">
        <CheckoutHeader />
        <div className="flex-1">
          <EmptyCart />
        </div>
        <CheckoutFooter />
      </div>
    );
  }

  return (
    <div className="paper flex min-h-dvh flex-col">
      <CheckoutHeader />
      {!hasSoldOut && <ReservationBanner label={reservation.label} />}

      <form
        onSubmit={onSubmit}
        className="container-px mx-auto grid w-full max-w-[90rem] flex-1 gap-10 py-10 lg:grid-cols-[1fr_minmax(360px,26rem)] lg:gap-14 lg:py-12"
      >
        {/* ---------- Left: details ---------- */}
        <div className="space-y-9">
          <ContactSection
            email={email}
            phone={phone}
            onPhoneChange={setPhone}
            onEmailChange={setEmail}
            errors={visibleErrors}
            onBlurField={handleBlur}
          />
          <ShippingSection
            address={address}
            onChange={patchAddress}
            firstName={firstName}
            lastName={lastName}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            errors={visibleErrors}
            onBlurField={handleBlur}
            pincodeStatus={pincodeStatus}
            pincodeInfo={pincodeInfo}
          />
        </div>

        {/* ---------- Right: order summary ---------- */}
        <OrderSummary
          items={items}
          subtotal={subtotal}
          shipping={shipping}
          tax={tax}
          total={subtotal + shipping + tax}
          canCheckout={canCheckout}
          onAttemptCheckout={attemptCheckout}
          customer={{ firstName, lastName, email, phone }}
          address={address}
          soldOutIds={soldOutIds}
          onOrderStart={reservation.pause}
          onOrderCancelled={reservation.resume}
          onSuccess={handleSuccess}
        />
      </form>

      <CheckoutFooter />
    </div>
  );
}
