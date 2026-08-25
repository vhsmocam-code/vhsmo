"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Check, Loader2, X } from "lucide-react";
import type { ProductVariant } from "@/lib/products";
import {
  CountryCodeSelect,
  DEFAULT_COUNTRY,
  type CountryCode,
} from "@/components/layout/CountryCodeSelect";

type Status = "idle" | "sending" | "done" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY = { name: "", email: "", phone: "" };

// text-base on mobile (16px) stops iOS Safari from auto-zooming on focus;
// md:text-sm restores the 14px desktop look.
const INPUT_CLASS =
  "w-full min-w-0 rounded-xl border-2 border-darkroom/15 bg-overexpose px-4 py-3 text-base md:text-sm text-darkroom outline-none transition-colors placeholder:text-darkroom/35 hover:border-darkroom/30 focus:border-darkroom disabled:opacity-50";

const LABEL_CLASS =
  "text-xs font-bold uppercase tracking-wider text-darkroom/60";

/**
 * The "Notify me" popup shown when a sold-out finish is selected. Collects a
 * name, phone and email and posts them to /api/notify-me, which records the
 * signup (and which finish it's for) in Supabase so we can reach out on restock.
 */
export function NotifyMeModal({
  variant,
  open,
  onClose,
}: {
  variant: ProductVariant;
  open: boolean;
  onClose: () => void;
}) {
  const [values, setValues] = useState(EMPTY);
  const [dialCode, setDialCode] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [status, setStatus] = useState<Status>("idle");

  const sending = status === "sending";

  // Reset the form each time the popup opens so a fresh finish starts clean.
  useEffect(() => {
    if (open) {
      setValues(EMPTY);
      setDialCode(DEFAULT_COUNTRY);
      setStatus("idle");
    }
  }, [open]);

  // Close on Escape and lock body scroll while the popup is up.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const isValid =
    values.name.trim().length > 0 &&
    EMAIL_RE.test(values.email.trim()) &&
    values.phone.replace(/[^\d]/g, "").length >= 7;

  function set<K extends keyof typeof EMPTY>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    if (status === "error") setStatus("idle");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending || !isValid) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/notify-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: `+${dialCode.dial} ${values.phone.trim()}`,
          sku: variant.sku,
          variant: variant.color,
        }),
      });
      const data = await res.json().catch(() => null);
      setStatus(res.ok && data?.success ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-darkroom/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Notify me when ${variant.color} is back`}
            className="relative w-full max-w-md rounded-3xl bg-halide p-6 shadow-2xl sm:p-8"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-darkroom/50 transition-colors hover:bg-darkroom/10 hover:text-darkroom"
            >
              <X className="size-5" />
            </button>

            {status === "done" ? (
              <div className="flex flex-col items-center py-4 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-bluehour text-halide">
                  <Check className="size-7" aria-hidden />
                </span>
                <h2 className="font-marker mt-5 text-3xl text-darkroom">
                  You&apos;re on the list!
                </h2>
                <p className="mt-2 max-w-sm text-sm text-darkroom/65">
                  We&apos;ll ping you the moment {variant.color} is back in
                  stock.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 rounded-full bg-darkroom px-6 py-3 text-sm font-bold text-overexpose transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-kodak text-darkroom">
                    <Bell className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h2 className="display text-2xl text-darkroom">
                      Notify me when in stock
                    </h2>
                    <p className="text-sm text-darkroom/65">
                      {variant.color} is sold out - we&apos;ll let you know when
                      it&apos;s back.
                    </p>
                  </div>
                </div>

                <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
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

                  {/* Not a <label>: it wraps two controls (picker + input). */}
                  <div className="flex flex-col gap-1.5">
                    <span id="notify-phone-label" className={LABEL_CLASS}>
                      Phone number
                    </span>
                    <div className="flex items-start gap-2">
                      <CountryCodeSelect
                        value={dialCode}
                        onChange={setDialCode}
                        disabled={sending}
                      />
                      <input
                        type="tel"
                        name="phone"
                        value={values.phone}
                        onChange={(e) =>
                          // Digits and the usual separators only - the dial code
                          // comes from the picker beside it.
                          set("phone", e.target.value.replace(/[^\d\s-]/g, ""))
                        }
                        disabled={sending}
                        required
                        placeholder="98765 43210"
                        autoComplete="tel-national"
                        inputMode="tel"
                        maxLength={16}
                        aria-labelledby="notify-phone-label"
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>

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

                  <button
                    type="submit"
                    disabled={!isValid || sending}
                    className="mt-1 flex items-center justify-center gap-2 rounded-full bg-bluehour px-6 py-3.5 text-sm font-bold text-halide transition-colors duration-300 hover:bg-kodak hover:text-darkroom disabled:cursor-not-allowed disabled:bg-darkroom/20 disabled:text-darkroom/40 disabled:hover:bg-darkroom/20 disabled:hover:text-darkroom/40"
                  >
                    {sending && (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    )}
                    {sending ? "Sending..." : "Notify me when in stock"}
                  </button>

                  {status === "error" && (
                    <p
                      role="alert"
                      className="text-xs font-semibold text-red-500"
                    >
                      That didn&apos;t work - please try again in a moment.
                    </p>
                  )}
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
