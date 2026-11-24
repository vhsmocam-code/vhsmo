"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, ShieldCheck, X } from "lucide-react";
import { track } from "@vercel/analytics";
import { formatCurrency } from "@/lib/utils";
import { COD_FEE_DISPLAY } from "@/lib/cod/fee";
import { maskEmail } from "@/lib/cod/format";
import { otpChannel } from "@/lib/cod/config";

type Props = {
  /** The email (default) or phone (SMS channel) the code is sent to. */
  contact: string;
  total: number;
  onClose: () => void;
  /** Called with the one-use token; the parent places the order. */
  onVerified: (token: string) => Promise<void>;
};

/**
 * Sends an SMS code to the checkout phone on open, then verifies it. Shows the
 * exact cash amount (fee included) so the shopper confirms what they'll pay.
 */
export function CodOtpDialog({ contact, total, onClose, onVerified }: Props) {
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const sentOnce = useRef(false);

  const channel = otpChannel();
  const body = (extra: Record<string, string> = {}) =>
    channel === "email" ? { email: contact.trim(), ...extra } : { phone: contact, ...extra };
  const digits = contact.replace(/\D/g, "").slice(-10);
  const masked =
    channel === "email" ? maskEmail(contact) : `+91 ${digits.slice(0, 2)}••••••${digits.slice(-2)}`;

  const send = useCallback(async () => {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/cod/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body()),
      });
      const data = await res.json().catch(() => ({}));
      if (typeof data.resendIn === "number") setResendIn(data.resendIn);
      if (!res.ok || !data.ok) {
        setError(data.message ?? "Could not send the code. Please try again.");
        return;
      }
      track("cod_otp_sent", { source: "checkout" });
      inputRef.current?.focus();
    } catch {
      setError("Could not send the code. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }, [contact, channel]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (sentOnce.current) return;
    sentOnce.current = true;
    void send();
  }, [send]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !verifying) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, verifying]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (verifying || code.length < 4) return;
    setVerifying(true);
    setError("");
    try {
      const res = await fetch("/api/cod/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body({ code })),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok || !data.token) {
        setError(data.message ?? "Could not verify the code.");
        setVerifying(false);
        return;
      }
      track("cod_otp_verified", { source: "checkout" });
      await onVerified(data.token);
      // On success the parent navigates away; on failure it shows an error.
      setVerifying(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setVerifying(false);
    }
  };

  // Rendered in a portal: the checkout page wraps everything in its own <form>,
  // and a <form> nested inside another one submits the outer form instead.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cod-otp-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={() => !verifying && onClose()}
        className="absolute inset-0 cursor-default bg-darkroom/60 backdrop-blur-sm"
      />
      <form
        onSubmit={submit}
        className="relative w-full max-w-md rounded-2xl border border-darkroom/10 bg-overexpose p-6 shadow-[0_30px_80px_-24px_rgba(31,26,24,0.6)]"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={verifying}
          aria-label="Close"
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-darkroom/45 transition-colors hover:bg-darkroom/[0.06] hover:text-darkroom/70"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-bluehour/10 text-bluehour">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h3 id="cod-otp-title" className="text-base font-bold text-darkroom">
              {channel === "email" ? "Verify your email" : "Verify your phone"}
            </h3>
            <p className="text-xs text-darkroom/55">
              {sending
                ? "Sending a code…"
                : `We sent a code to ${masked}${channel === "email" ? ". Check spam if you don't see it." : ""}`}
            </p>
          </div>
        </div>

        <label className="mt-5 block">
          <span className="sr-only">Verification code</span>
          <input
            ref={inputRef}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{4,8}"
            maxLength={8}
            placeholder="••••••"
            aria-invalid={Boolean(error)}
            className="w-full rounded-xl border-2 border-darkroom/15 bg-transparent px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] tabular-nums text-darkroom outline-none focus:border-bluehour"
          />
        </label>

        {error && (
          <p role="alert" className="mt-2 text-xs font-semibold text-red-600">
            {error}
          </p>
        )}

        <div className="mt-2 text-right text-xs">
          <button
            type="button"
            disabled={sending || resendIn > 0 || verifying}
            onClick={send}
            className="font-semibold text-bluehour disabled:text-darkroom/40"
          >
            {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
          </button>
        </div>

        <div className="mt-4 rounded-xl bg-kodak/40 p-3.5 text-xs leading-relaxed text-darkroom">
          You&apos;ll pay <strong>{formatCurrency(total)}</strong> in cash or UPI on delivery. This
          includes a <strong>{formatCurrency(COD_FEE_DISPLAY)} Cash on Delivery fee</strong>.
        </div>

        <button
          type="submit"
          disabled={verifying || code.length < 4}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-bluehour px-6 py-3.5 text-sm font-bold tracking-tight text-overexpose transition-all disabled:opacity-60"
        >
          {verifying ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Placing order…
            </>
          ) : (
            `Verify & place order · ${formatCurrency(total)}`
          )}
        </button>
      </form>
    </div>,
    document.body,
  );
}
