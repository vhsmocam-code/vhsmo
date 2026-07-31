"use client";

import { useMemo, useState } from "react";
import { Country } from "country-state-city";
import { Check, Globe, Loader2 } from "lucide-react";
import {
  CountryCodeSelect,
  DEFAULT_COUNTRY,
  type CountryCode,
} from "@/components/layout/CountryCodeSelect";
import {
  LocationSelect,
  type LocationOption,
} from "@/components/checkout/LocationSelect";
import { iconClass } from "@/components/checkout/styles";

type Status = "idle" | "sending" | "done" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COLOURS = ["Baby Pink", "Black", "Cherry Red", "Not sure yet"];

const EMPTY = {
  name: "",
  email: "",
  whatsapp: "",
  country: "",
  city: "",
  postalCode: "",
  address: "",
  colour: "",
  notes: "",
};

// text-base on mobile (16px) stops iOS Safari from auto-zooming on focus;
// md:text-sm restores the 14px desktop look.
const INPUT_CLASS =
  "w-full min-w-0 rounded-xl border-2 border-darkroom/15 bg-overexpose px-4 py-3 text-base md:text-sm text-darkroom outline-none transition-colors placeholder:text-darkroom/35 hover:border-darkroom/30 focus:border-darkroom disabled:opacity-50";

const LABEL_CLASS =
  "text-xs font-bold uppercase tracking-wider text-darkroom/60";

/**
 * The form behind /international-order. Checkout only delivers to Indian PIN
 * codes, so buyers outside India (and its union territories - those PIN codes
 * are serviceable, so they go through checkout) leave their details here and
 * the order is arranged directly. Posts to /api/international-order, which
 * stores the row in Supabase.
 */
export function InternationalOrderForm() {
  const [values, setValues] = useState(EMPTY);
  const [dialCode, setDialCode] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [status, setStatus] = useState<Status>("idle");

  const sending = status === "sending";

  // Checkout owns India - it never appears as a destination here.
  const countries = useMemo<LocationOption[]>(
    () =>
      Country.getAllCountries()
        .filter((c) => c.isoCode !== "IN")
        .map((c) => ({ name: c.name, isoCode: c.isoCode })),
    [],
  );

  const isValid =
    values.name.trim().length > 0 &&
    EMAIL_RE.test(values.email.trim()) &&
    values.whatsapp.replace(/[^\d]/g, "").length >= 7 &&
    values.country.length > 0 &&
    values.city.trim().length > 0 &&
    values.postalCode.trim().length > 0 &&
    values.address.trim().length >= 10 &&
    values.colour.length > 0;

  function set<K extends keyof typeof EMPTY>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    if (status === "error") setStatus("idle");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending || !isValid) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/international-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          whatsapp: values.whatsapp.trim(),
          countryCode: dialCode.dial,
          country: values.country,
          city: values.city.trim(),
          postalCode: values.postalCode.trim(),
          address: values.address.trim(),
          colour: values.colour,
          notes: values.notes.trim(),
        }),
      });
      const data = await res.json().catch(() => null);
      setStatus(res.ok && data?.success ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-halide p-8 text-center sm:p-10">
        <span className="flex size-14 items-center justify-center rounded-full bg-bluehour text-halide">
          <Check className="size-7" aria-hidden />
        </span>
        <h2 className="font-marker mt-5 text-3xl text-darkroom">
          Request received!
        </h2>
        <p className="mt-2 max-w-sm text-sm text-darkroom/65">
          We&apos;ll reach out on WhatsApp or email with shipping options and
          the total for your country.
        </p>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4 rounded-2xl bg-halide p-6 sm:p-8"
      onSubmit={onSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={LABEL_CLASS}>Name</span>
          <input
            type="text"
            name="name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            disabled={sending}
            required
            placeholder="Your name"
            autoComplete="name"
            className={INPUT_CLASS}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={LABEL_CLASS}>Email</span>
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            disabled={sending}
            required
            placeholder="you@email.com"
            autoComplete="email"
            inputMode="email"
            className={INPUT_CLASS}
          />
        </label>
      </div>

      {/* Not a <label>: it wraps two controls (picker + input). */}
      <div className="flex flex-col gap-1.5">
        <span id="intl-whatsapp-label" className={LABEL_CLASS}>
          WhatsApp number
        </span>
        <div className="flex items-start gap-2">
          <CountryCodeSelect
            value={dialCode}
            onChange={setDialCode}
            disabled={sending}
          />
          <input
            type="tel"
            name="whatsapp"
            value={values.whatsapp}
            onChange={(e) =>
              // Digits and the usual separators only - the dial code comes
              // from the picker beside it.
              set("whatsapp", e.target.value.replace(/[^\d\s-]/g, ""))
            }
            disabled={sending}
            required
            placeholder="98765 43210"
            autoComplete="tel-national"
            inputMode="tel"
            aria-labelledby="intl-whatsapp-label"
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <LocationSelect
          label="Country"
          placeholder="Select country"
          className="sm:col-span-2"
          required
          disabled={sending}
          icon={<Globe className={iconClass} />}
          value={values.country}
          options={countries}
          onSelect={(o) => set("country", o.name)}
        />
        <label className="flex flex-col gap-1.5">
          <span className={LABEL_CLASS}>City</span>
          <input
            type="text"
            name="city"
            value={values.city}
            onChange={(e) => set("city", e.target.value)}
            disabled={sending}
            required
            placeholder="Your city"
            autoComplete="address-level2"
            className={INPUT_CLASS}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={LABEL_CLASS}>PIN / postal code</span>
          <input
            type="text"
            name="postalCode"
            value={values.postalCode}
            onChange={(e) => set("postalCode", e.target.value)}
            disabled={sending}
            required
            placeholder="e.g. 94103"
            autoComplete="postal-code"
            maxLength={16}
            className={INPUT_CLASS}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>Shipping address</span>
        <textarea
          name="address"
          value={values.address}
          onChange={(e) => set("address", e.target.value)}
          disabled={sending}
          required
          rows={3}
          maxLength={400}
          placeholder="Street, apartment, area…"
          autoComplete="street-address"
          className={`${INPUT_CLASS} resize-none`}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>Colour</span>
        <select
          name="colour"
          value={values.colour}
          onChange={(e) => set("colour", e.target.value)}
          disabled={sending}
          required
          className={INPUT_CLASS}
        >
          <option value="" disabled>
            Select colour
          </option>
          {COLOURS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>Anything else? (optional)</span>
        <textarea
          name="notes"
          value={values.notes}
          onChange={(e) => set("notes", e.target.value)}
          disabled={sending}
          rows={2}
          maxLength={400}
          placeholder="Questions, accessories, gift note…"
          className={`${INPUT_CLASS} resize-none`}
        />
      </label>

      <button
        type="submit"
        disabled={!isValid || sending}
        className="mt-2 flex items-center justify-center gap-2 rounded-full bg-bluehour px-6 py-3 text-sm font-bold text-halide transition-colors duration-300 hover:bg-kodak hover:text-darkroom disabled:cursor-not-allowed disabled:bg-darkroom/20 disabled:text-darkroom/40 disabled:hover:bg-darkroom/20 disabled:hover:text-darkroom/40"
      >
        {sending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {sending ? "Sending..." : "Request international order"}
      </button>

      {status === "error" && (
        <p role="alert" className="text-xs font-semibold text-red-500">
          That didn&apos;t work - please try again in a moment.
        </p>
      )}
    </form>
  );
}
