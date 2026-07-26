"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { City, Country, State } from "country-state-city";
import {
  Building2,
  Home,
  Landmark,
  Loader2,
  Mail,
  MapPin,
  Palette,
  Phone,
  User,
} from "lucide-react";
import {
  recoverySchema,
  RECOVERY_COLORS,
  type RecoveryClientData,
} from "@/lib/recovery";
// Reused, unchanged, from the checkout design system.
import { Field } from "@/components/checkout/Field";
import {
  LocationSelect,
  type LocationOption,
} from "@/components/checkout/LocationSelect";
import { PincodeField } from "@/components/checkout/PincodeField";
import { usePincodeServiceability } from "@/components/checkout/usePincodeServiceability";
import {
  cardClass,
  controlClass,
  disabledClass,
  iconClass,
  labelClass,
} from "@/components/checkout/styles";
import { Toast, type ToastState } from "./Toast";

type Values = {
  customerName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  color: string;
};

const EMPTY: Values = {
  customerName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  color: "",
};

type Errors = Partial<Record<keyof Values, string>>;

/**
 * The recovery form. Email is prefilled + read-only (it comes from the trusted
 * `incomplete_orders` row); the token is passed straight through to the API,
 * which re-validates it. On success we redirect to /complete-order/success.
 *
 * Delivery fields reuse the exact checkout building blocks - the cascading
 * State -> City `LocationSelect`s and the `PincodeField` with live Delhivery
 * serviceability - so the two forms behave identically. Country is locked to
 * India, just like checkout.
 */
export function RecoveryForm({ data }: { data: RecoveryClientData }) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  // Country -> State -> City, seeded from the locked India ISO (same as
  // checkout's ShippingSection).
  const countryIso = "IN";
  const [stateIso, setStateIso] = useState("");

  const states = useMemo<LocationOption[]>(
    () =>
      State.getStatesOfCountry(countryIso).map((s) => ({
        name: s.name,
        isoCode: s.isoCode,
      })),
    [],
  );

  const cities = useMemo<LocationOption[]>(
    () =>
      stateIso
        ? City.getCitiesOfState(countryIso, stateIso).map((c) => ({
            name: c.name,
            isoCode: c.name,
          }))
        : [],
    [stateIso],
  );

  const colourOptions = useMemo<LocationOption[]>(
    () => RECOVERY_COLORS.map((c) => ({ name: c, isoCode: c })),
    [],
  );

  const { status: pincodeStatus, info: pincodeInfo } =
    usePincodeServiceability(values.pincode);

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  function handleState(option: LocationOption) {
    setStateIso(option.isoCode);
    // New state drops the stale city, exactly like checkout.
    setValues((v) => ({ ...v, state: option.name, city: "" }));
    setErrors((e) => ({ ...e, state: undefined }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    // Validate with the SAME schema the server uses, so inline errors match.
    const parsed = recoverySchema.safeParse({ ...values, token: data.token });
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Values | undefined;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setToast({ kind: "error", message: "Please fix the highlighted fields." });
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      const res = await fetch("/api/complete-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.success) {
        setToast({ kind: "success", message: "Order saved! Redirecting…" });
        const query = json?.orderId
          ? `?order=${encodeURIComponent(json.orderId)}`
          : "";
        router.push(`/complete-order/success${query}`);
        return;
      }

      if (json?.field) {
        setErrors((prev) => ({ ...prev, [json.field]: json.message }));
      }
      setToast({
        kind: "error",
        message: json?.message ?? "Something went wrong. Please try again.",
      });
      setSubmitting(false);
    } catch {
      setToast({
        kind: "error",
        message: "Network error. Please check your connection and try again.",
      });
      setSubmitting(false);
    }
  }

  return (
    <>
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <form
        noValidate
        onSubmit={onSubmit}
        className="flex flex-col gap-6 rounded-2xl bg-halide p-6 sm:p-8"
      >
        {/* Customer details */}
        <fieldset className="flex flex-col gap-3.5" disabled={submitting}>
          <legend className="mb-1.5 text-sm font-bold text-darkroom">
            Customer details
          </legend>

          <div className="grid items-start gap-3.5 sm:grid-cols-2">
            <Field
              name="customerName"
              label="Full name"
              placeholder="Jane Doe"
              required
              autoComplete="name"
              maxLength={80}
              icon={<User className={iconClass} />}
              value={values.customerName}
              error={errors.customerName}
              onChange={(v) => set("customerName", v)}
            />
            <Field
              name="phone"
              label="Phone number"
              placeholder="98765 43210"
              required
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              maxLength={20}
              icon={<Phone className={iconClass} />}
              value={values.phone}
              error={errors.phone}
              onChange={(v) => set("phone", v.replace(/[^\d\s+-]/g, ""))}
            />
          </div>

          {/* Email is locked to the payment - reuses the checkout field look
              with the shared "disabled/locked" styling. */}
          <div>
            <label className={cardClass + " block " + disabledClass}>
              <div className="flex items-center gap-3">
                <span aria-hidden>
                  <Mail className={iconClass} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={labelClass}>Email</span>
                  <input
                    name="email"
                    type="email"
                    value={data.email}
                    readOnly
                    aria-readonly
                    className={controlClass + " cursor-not-allowed"}
                  />
                </span>
              </div>
            </label>
            <p className="mt-1.5 pl-1 text-xs text-darkroom/45">
              Linked to your payment — can&apos;t be changed.
            </p>
          </div>
        </fieldset>

        {/* Shipping address - same controls as checkout */}
        <fieldset className="flex flex-col gap-3.5" disabled={submitting}>
          <legend className="mb-1.5 text-sm font-bold text-darkroom">
            Shipping address
          </legend>

          <Field
            name="addressLine1"
            label="Street address"
            placeholder="Airport Road"
            required
            autoComplete="address-line1"
            maxLength={120}
            icon={<MapPin className={iconClass} />}
            value={values.addressLine1}
            error={errors.addressLine1}
            onChange={(v) => set("addressLine1", v)}
          />

          <Field
            name="addressLine2"
            label="Apartment, flat, landmark (optional)"
            placeholder="Flat 4B, near the park"
            autoComplete="address-line2"
            maxLength={120}
            icon={<Building2 className={iconClass} />}
            value={values.addressLine2}
            onChange={(v) => set("addressLine2", v)}
          />

          <div className="grid items-start gap-3.5 sm:grid-cols-2">
            <LocationSelect
              label="State / Province"
              placeholder="Select State"
              required
              icon={<Landmark className={iconClass} />}
              value={values.state}
              options={states}
              onSelect={handleState}
              error={errors.state}
              emptyMessage="No states available."
            />
            <LocationSelect
              label="City"
              placeholder="Select City"
              required
              disabled={!stateIso}
              icon={<Home className={iconClass} />}
              value={values.city}
              options={cities}
              onSelect={(o) => set("city", o.name)}
              error={errors.city}
              emptyMessage="No cities available for this state."
            />

            <PincodeField
              value={values.pincode}
              error={errors.pincode}
              status={pincodeStatus}
              info={pincodeInfo}
              onChange={(v) => set("pincode", v)}
              onBlur={() => {}}
            />

            <LocationSelect
              label="Colour"
              placeholder="Select Colour"
              required
              icon={<Palette className={iconClass} />}
              value={values.color}
              options={colourOptions}
              onSelect={(o) => set("color", o.name)}
              error={errors.color}
            />
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 flex items-center justify-center gap-2 rounded-full bg-bluehour px-6 py-3 text-sm font-bold text-halide transition-colors duration-300 hover:bg-kodak hover:text-darkroom disabled:cursor-not-allowed disabled:bg-darkroom/20 disabled:text-darkroom/40 disabled:hover:bg-darkroom/20 disabled:hover:text-darkroom/40"
        >
          {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {submitting ? "Saving…" : "Complete my order"}
        </button>
      </form>
    </>
  );
}
