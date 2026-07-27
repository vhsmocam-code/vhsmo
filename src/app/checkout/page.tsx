"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart-context";
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

export default function CheckoutPage() {
  const { items, subtotal, shipping, tax, count, isHydrated, clear } =
    useCart();

  // Checkout is open to everyone. Email is validated for format only.
  const { email, setEmail, status: emailStatus } = useEmailVerification();

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
    emailStatus === "verified" &&
    pincodeStatus !== "unserviceable";

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
            emailStatus={emailStatus}
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
          count={count}
          subtotal={subtotal}
          shipping={shipping}
          tax={tax}
          total={subtotal + shipping + tax}
          emailStatus={emailStatus}
          canCheckout={canCheckout}
          onAttemptCheckout={attemptCheckout}
          customer={{ firstName, lastName, email, phone }}
          address={address}
          onSuccess={handleSuccess}
        />
      </form>

      <CheckoutFooter />
    </div>
  );
}
