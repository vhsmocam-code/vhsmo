"use client";

import { useState } from "react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import {
  NOTES_MAX,
  validateRefundField,
  validateRefundRequest,
  type RefundErrors,
  type RefundField,
} from "@/lib/refund-validation";

type Status = "idle" | "sending" | "done" | "error";

const EMPTY = {
  orderId: "",
  name: "",
  email: "",
  notes: "",
};

// text-base on mobile (16px) stops iOS Safari from auto-zooming on focus;
// md:text-sm restores the 14px desktop look.
const INPUT_CLASS =
  "w-full min-w-0 rounded-xl border-2 bg-overexpose px-4 py-3 text-base md:text-sm text-darkroom outline-none transition-colors placeholder:text-darkroom/35 disabled:opacity-50";

const INPUT_OK =
  "border-darkroom/15 hover:border-darkroom/30 focus:border-darkroom";
const INPUT_BAD = "border-red-500/60 focus:border-red-500";

const LABEL_CLASS =
  "text-xs font-bold uppercase tracking-wider text-darkroom/60";

const HINT_CLASS = "text-xs text-darkroom/45";

/** The red asterisk on required labels. The input's own `required` carries the
 *  semantics, so the glyph is decorative and hidden from screen readers. */
function Req() {
  return (
    <span className="ml-0.5 text-red-500" aria-hidden>
      *
    </span>
  );
}

/** Inline field error, styled to match the checkout form's. */
function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p
      id={id}
      role="alert"
      className="status-rise flex items-center gap-1 pl-1 text-xs font-semibold text-red-500"
    >
      <AlertCircle className="size-3.5 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

/**
 * The form behind /refund-request - the on-site replacement for the Google
 * Form we were sending pre-order customers who no longer want to wait out the
 * delay. Four questions, same as the form it replaces: order ID, the name and
 * email on the order, and an optional note.
 *
 * Fields validate on blur and on submit - never while typing, which would
 * fight the user mid-word - against the shared rules in `lib/refund-validation`
 * that the API route re-runs server-side.
 *
 * A refund is final, so the submit button is gated on an explicit
 * acknowledgement checkbox. Posts to /api/refund-request, which soft-matches
 * the order ID against `orders` and stores the row in `refund_requests`.
 */
export function RefundRequestForm() {
  const [values, setValues] = useState(EMPTY);
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<RefundErrors>({});
  // A field's error only shows once they've left it or tried to submit, so the
  // form doesn't shout at a half-typed email.
  const [touched, setTouched] = useState<Partial<Record<RefundField, boolean>>>(
    {},
  );

  const sending = status === "sending";

  function set<K extends keyof typeof EMPTY>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    // Clear a field's error as soon as it's fixed, but never raise a new one
    // mid-keystroke.
    if (key !== "notes" && errors[key as RefundField]) {
      const stillBad = validateRefundField(key as RefundField, {
        ...values,
        [key]: value,
      });
      if (!stillBad) setErrors((e) => ({ ...e, [key]: undefined }));
    }
    if (status === "error") {
      setStatus("idle");
      setErrorMessage(null);
    }
  }

  function blur(field: RefundField) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({ ...e, [field]: validateRefundField(field, values) }));
  }

  function errorFor(field: RefundField) {
    return touched[field] ? errors[field] : undefined;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;

    const found = validateRefundRequest(values);
    setErrors(found);
    setTouched({ orderId: true, name: true, email: true });
    if (Object.keys(found).length > 0 || !confirmed) return;

    setStatus("sending");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/refund-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: values.orderId.trim(),
          name: values.name.trim(),
          email: values.email.trim(),
          notes: values.notes.trim(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setStatus("done");
        return;
      }
      // The server re-runs the same rules - surface whichever field it rejected
      // against that field rather than as a generic failure.
      if (data?.field && typeof data.message === "string") {
        const field = data.field as RefundField;
        setErrors((prev) => ({ ...prev, [field]: data.message }));
        setTouched((t) => ({ ...t, [field]: true }));
        setStatus("idle");
        return;
      }
      setErrorMessage(typeof data?.message === "string" ? data.message : null);
      setStatus("error");
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
          Request received
        </h2>
        <p className="mt-2 max-w-sm text-sm text-darkroom/65">
          Your refund request has been logged against order{" "}
          <span className="font-semibold text-darkroom">
            {values.orderId.trim()}
          </span>
          . We&apos;ll process it and email{" "}
          <span className="font-semibold text-darkroom">
            {values.email.trim()}
          </span>{" "}
          once the refund is on its way back to your original payment method.
        </p>
        <p className="mt-4 max-w-sm text-xs text-darkroom/45">
          Thank you for backing VHSMO early - we&apos;re sorry we couldn&apos;t
          meet the original timeline.
        </p>
      </div>
    );
  }

  const orderIdError = errorFor("orderId");
  const nameError = errorFor("name");
  const emailError = errorFor("email");

  return (
    <form
      className="flex flex-col gap-4 rounded-2xl bg-halide p-6 sm:p-8"
      onSubmit={onSubmit}
      noValidate
    >
      <label className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>
          Order ID
          <Req />
        </span>
        <input
          type="text"
          name="orderId"
          value={values.orderId}
          onChange={(e) => set("orderId", e.target.value)}
          onBlur={() => blur("orderId")}
          disabled={sending}
          required
          placeholder="order_XXXXXXXXXXXXXX"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={64}
          aria-invalid={Boolean(orderIdError)}
          aria-describedby={
            orderIdError ? "refund-orderId-error" : "refund-orderId-hint"
          }
          className={`${INPUT_CLASS} ${orderIdError ? INPUT_BAD : INPUT_OK}`}
        />
        {orderIdError ? (
          <FieldError id="refund-orderId-error" message={orderIdError} />
        ) : (
          <span id="refund-orderId-hint" className={HINT_CLASS}>
            This is not your Payment ID or Invoice Number. You&apos;ll find it
            in your order confirmation email.
          </span>
        )}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={LABEL_CLASS}>
            Full name on the order
            <Req />
          </span>
          <input
            type="text"
            name="name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            onBlur={() => blur("name")}
            disabled={sending}
            required
            placeholder="Your name"
            autoComplete="name"
            maxLength={80}
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? "refund-name-error" : undefined}
            className={`${INPUT_CLASS} ${nameError ? INPUT_BAD : INPUT_OK}`}
          />
          {nameError && (
            <FieldError id="refund-name-error" message={nameError} />
          )}
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={LABEL_CLASS}>
            Email on the order
            <Req />
          </span>
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => blur("email")}
            disabled={sending}
            required
            placeholder="you@email.com"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={254}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "refund-email-error" : undefined}
            className={`${INPUT_CLASS} ${emailError ? INPUT_BAD : INPUT_OK}`}
          />
          {emailError && (
            <FieldError id="refund-email-error" message={emailError} />
          )}
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>
          Anything else you&apos;d like us to know (optional)
        </span>
        <textarea
          name="notes"
          value={values.notes}
          onChange={(e) => set("notes", e.target.value)}
          disabled={sending}
          rows={3}
          maxLength={NOTES_MAX}
          placeholder="Your answer"
          className={`${INPUT_CLASS} ${INPUT_OK} resize-none`}
        />
      </label>

      <label className="mt-1 flex cursor-pointer items-start gap-3 rounded-xl border-2 border-darkroom/15 bg-overexpose p-4">
        <input
          type="checkbox"
          name="confirmed"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          disabled={sending}
          className="mt-0.5 size-4 shrink-0 accent-bluehour"
        />
        <span className="text-xs leading-relaxed text-darkroom/70">
          I understand this request is{" "}
          <span className="font-bold text-darkroom">
            final and cannot be reversed
          </span>
          . My order will be cancelled and any pre-order benefits attached to it
          will no longer apply.
        </span>
      </label>

      <button
        type="submit"
        disabled={!confirmed || sending}
        className="mt-2 flex items-center justify-center gap-2 rounded-full bg-bluehour px-6 py-3 text-sm font-bold text-halide transition-colors duration-300 hover:bg-kodak hover:text-darkroom disabled:cursor-not-allowed disabled:bg-darkroom/20 disabled:text-darkroom/40 disabled:hover:bg-darkroom/20 disabled:hover:text-darkroom/40"
      >
        {sending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {sending ? "Submitting..." : "Submit refund request"}
      </button>

      {status === "error" && (
        <p role="alert" className="text-xs font-semibold text-red-500">
          {errorMessage ?? "That didn't work - please try again in a moment."}
        </p>
      )}
    </form>
  );
}
