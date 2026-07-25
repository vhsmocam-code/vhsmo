"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Lock, Mail } from "lucide-react";
import { cardClass, controlClass, iconClass, labelClass } from "./styles";

type GateStatus = "idle" | "checking" | "notfound" | "error";

type WaitlistGateProps = {
  /** Pre-fills the field (e.g. a persisted email) without unlocking. */
  defaultEmail?: string;
  /** Called with the verified email once it's confirmed on the waitlist. */
  onUnlock: (email: string) => void;
};

/**
 * A blocking overlay that locks the checkout until the visitor proves they're
 * on the waitlist. The page behind it stays mounted (so persisted draft state
 * survives) but is inert and hidden until this gate calls `onUnlock`.
 */
export function WaitlistGate({ defaultEmail = "", onUnlock }: WaitlistGateProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [status, setStatus] = useState<GateStatus>("idle");
  // Whether the visitor has edited the field. Until they do, mirror the
  // persisted email as it hydrates - so a returning visitor sees their address
  // pre-filled but still has to press "Unlock checkout" to reveal the page.
  const [dirty, setDirty] = useState(false);

  const trimmed = email.trim();
  const isFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  const checking = status === "checking";

  useEffect(() => {
    if (!dirty) setEmail(defaultEmail);
  }, [defaultEmail, dirty]);

  // Lock body scroll while the gate is up.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  async function verify() {
    if (checking || !isFormatValid) return;
    setStatus("checking");
    try {
      const res = await fetch("/api/waitlist/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (data.exists) {
        onUnlock(trimmed);
      } else {
        setStatus("notfound");
      }
    } catch {
      setStatus("error");
    }
  }

  const message =
    status === "notfound"
      ? "This email isn't on the waitlist. Use the email you signed up with."
      : status === "error"
        ? "Something went wrong. Please try again."
        : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-darkroom/45 p-5 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-gate-title"
    >
      <div className="w-full max-w-md rounded-2xl border-2 border-darkroom/12 bg-overexpose p-7 shadow-[0_24px_70px_-24px_rgba(31,26,24,0.55)] sm:p-8">
        <span className="flex size-12 items-center justify-center rounded-full bg-bluehour/12 text-bluehour">
          <Lock className="size-5" />
        </span>

        <h2
          id="waitlist-gate-title"
          className="mt-5 text-xl font-bold text-darkroom"
        >
          Waitlist checkout
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-darkroom/60">
          Checkout is open to waitlist members only. Enter the email you joined
          the waitlist with to unlock your order.
        </p>

        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            verify();
          }}
        >
          <label className={cardClass + " block cursor-text"}>
            <div className="flex items-center gap-3">
              <span aria-hidden>
                <Mail className={iconClass} />
              </span>
              <span className="min-w-0 flex-1">
                <span className={labelClass}>Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setDirty(true);
                    setEmail(e.target.value);
                    if (status !== "idle") setStatus("idle");
                  }}
                  placeholder="you@gmail.com"
                  autoComplete="email"
                  inputMode="email"
                  maxLength={254}
                  className={controlClass}
                />
              </span>
              {checking && (
                <Loader2 className="size-4 shrink-0 animate-spin text-darkroom/40" />
              )}
            </div>
          </label>

          {message && (
            <p className="status-rise mt-2 flex items-center gap-1.5 pl-1 text-xs font-semibold text-red-500">
              <AlertCircle className="size-3.5 shrink-0" />
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={checking || !isFormatValid}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-bluehour px-8 py-3.5 text-base font-bold tracking-tight text-overexpose transition-all duration-300 ease-[var(--ease-out-expo)] hover:shadow-[0_0_0_5px_rgba(16,147,255,0.25)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:hover:shadow-none disabled:active:scale-100"
          >
            {checking ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Checking waitlist…
              </>
            ) : (
              <>
                <Lock className="size-4" />
                Unlock checkout
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-darkroom/50">
          Issue with your waitlist status?{" "}
          <a href="mailto:team@vhsmo.com" className="font-semibold text-bluehour hover:underline">
            Contact us 
          </a>
          .
        </p>
      </div>
    </div>
  );
}
