"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Clock, Copy, TicketPercent, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

/**
 * A promo popup. It opens centered on first load (a dim-backdrop modal), and
 * closing slides it off toward the right edge, leaving a slim ribbon tab behind
 * — click the tab and it re-opens centered. Paper + darkroom + kodak only, so
 * it reads as part of the scrapbook brand rather than a generic marketing
 * modal. Collapsed state is remembered per session (and it self-hides once the
 * coupon expires), so it never nags.
 */

// Straight from the coupons table. `value`/`minimum_order` arrive as strings.
const COUPON = {
  code: "QC3R8Y",
  type: "fixed" as "fixed" | "percent",
  value: 1000,
  minimumOrder: 5999,
  // 23  Aug 2026, 12:00 AM (local midnight).
  expiry : "false",
  expiresAt: "2026-08-23 06:00:00",
};

// Persisted across sessions so the modal auto-opens only on the very first
// visit. After that it stays collapsed as the tab until the user re-opens it.
const SEEN_KEY = "vhsmo-coupon-NK7X4Y-seen";
const REVEAL_DELAY = 2000; // ms before it opens on first visit

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
};

function getTimeLeft(target: number): TimeLeft {
  const diff = target - Date.now();
  if (diff <= 0)
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: false,
  };
}

export function CouponPopup() {
  const reduceMotion = useReducedMotion();
  const expiry = useMemo(() => new Date(COUPON.expiresAt).getTime(), []);

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [time, setTime] = useState<TimeLeft>(() => getTimeLeft(expiry));

  // Auto-open only on the very first visit, after a short beat — unless the
  // coupon has expired or this browser has already seen it. On every later
  // visit it stays collapsed as the tab until the user re-opens it.
  useEffect(() => {
    if (getTimeLeft(expiry).done) return;
    let seen = false;
    try {
      seen = !!localStorage.getItem(SEEN_KEY);
    } catch {
      /* storage blocked - treat as first visit */
    }
    if (seen) return;
    const t = setTimeout(() => {
      setOpen(true);
      try {
        localStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* storage blocked - it may auto-open again next load, that's fine */
      }
    }, REVEAL_DELAY);
    return () => clearTimeout(t);
  }, [expiry]);

  // Tick the countdown. Runs even while collapsed so the whole thing (tab
  // included) disappears the moment the coupon expires.
  useEffect(() => {
    const id = setInterval(() => {
      const next = getTimeLeft(expiry);
      setTime(next);
      if (next.done) setOpen(false);
    }, 1000);
    return () => clearInterval(id);
  }, [expiry]);

  // Slide it off-screen, leaving the tab so it can be re-opened. Also mark it
  // seen so it never auto-opens again on a later visit.
  const collapse = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* storage blocked - fine, first-visit auto-open may repeat */
    }
  }, []);

  // Slide it back out (user-initiated, from the tab).
  const expand = useCallback(() => setOpen(true), []);

  // Escape collapses the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && collapse();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, collapse]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(COUPON.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked - the code is still on screen to type manually */
    }
  }, []);

  const valueLabel =
    COUPON.type === "fixed" ? formatCurrency(COUPON.value) : `${COUPON.value}%`;

  // Once expired, nothing renders at all — not even the tab.
  if (time.done) return null;

  return (
    <>
      {/* Centered modal — how the offer opens on load and every time it's
          re-opened from the tab. Closing slides it off toward the right edge. */}
      <AnimatePresence>
        {open && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Discount coupon offer"
            className="fixed inset-0 z-[91] flex items-center justify-center px-4"
          >
            {/* Dim backdrop — click anywhere to hide */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={collapse}
              className="absolute inset-0 bg-darkroom-deep/50 backdrop-blur-[2px]"
            />

            <motion.div
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 14, scale: 0.94 }
              }
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: "60vw", scale: 0.9 }
              }
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-halide text-darkroom shadow-[0_1.2rem_2.5rem_rgba(31,26,24,0.45)] ring-1 ring-darkroom/15"
            >
              {/* kodak header band */}
              <div className="relative flex items-center justify-between bg-kodak px-5 py-3">
                <span className="font-marker inline-flex items-center gap-1.5 text-sm uppercase tracking-wide text-darkroom">
                  <TicketPercent className="size-[1.15rem]" strokeWidth={2.25} />
                  Limited offer
                </span>
                <button
                  type="button"
                  onClick={collapse}
                  aria-label="Hide offer"
                  className="flex size-8 items-center justify-center rounded-full text-darkroom transition-colors hover:bg-darkroom/10"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="px-5 pb-5 pt-4">
                {/* Value */}
                <p className="display text-[clamp(2.2rem,7vw,2.8rem)] leading-[0.95] text-darkroom">
                  {valueLabel} <span className="text-darkroom/70">OFF</span>
                </p>
                <p className="mt-1 text-sm text-darkroom/65">
                  on orders over {formatCurrency(COUPON.minimumOrder)}
                </p>

                {/* Code - a torn ticket stub */}
                <div className="mt-4 flex items-stretch overflow-hidden rounded-xl border-2 border-dashed border-darkroom/35">
                  <div className="flex flex-1 flex-col justify-center px-4 py-2.5">
                    <span className="text-[0.65rem] uppercase tracking-[0.18em] text-darkroom/50">
                      Use code
                    </span>
                    <span className=" text-xl leading-tight tracking-wide text-darkroom">
                      {COUPON.code}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={copy}
                    aria-label={copied ? "Code copied" : "Copy code"}
                    className="flex items-center gap-1.5 bg-darkroom px-4 text-sm font-semibold text-halide transition-colors hover:bg-darkroom-deep"
                  >
                    {copied ? (
                      <>
                        <Check className="size-4" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-4" /> Copy
                      </>
                    )}
                  </button>
                </div>

                {/* Countdown */}
                {
false ? (
               <div className="mt-4">
                  <p className="mb-2 flex items-center justify-center gap-1.5 text-center text-[0.7rem] uppercase tracking-[0.18em] text-darkroom/50">
                    <Clock className="size-3.5" strokeWidth={2.25} />
                    Ends in
                  </p>
                  <div className="flex items-stretch justify-center gap-1.5">
                    <TimeCell value={time.days} label="days" />
                    <Colon />
                    <TimeCell value={time.hours} label="hrs" />
                    <Colon />
                    <TimeCell value={time.minutes} label="min" />
                    <Colon />
                    <TimeCell value={time.seconds} label="sec" />
                  </div>
                </div>) :( <div className="mt-4">
                  <p className="mb-2 flex items-center justify-center gap-1.5 text-center text-[0.7rem] uppercase tracking-[0.18em] text-darkroom/50">
                    <Clock className="size-3.5" strokeWidth={2.25} />
                   Till the stock lasts
                  </p>
</div>)

                }
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ribbon tab — the only thing left once the modal is hidden. Pinned to
          the right edge; slides in from off-screen and re-opens the modal. */}
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            onClick={expand}
            aria-label="Open discount offer"
            initial={reduceMotion ? { opacity: 0 } : { x: "110%" }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: "110%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="group fixed right-0 top-1/2 z-[90] flex -translate-y-1/2 flex-col items-center gap-2 rounded-l-2xl bg-kodak py-4 pl-3.5 pr-3 text-darkroom shadow-[0_0.6rem_1.5rem_rgba(31,26,24,0.4)] ring-1 ring-darkroom/15 transition-[padding] hover:pr-3.5"
          >
            {/* attention pulse */}
            <span className="absolute -left-1 -top-1 flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-darkroom/60" />
              <span className="relative inline-flex size-3 rounded-full bg-darkroom" />
            </span>
            <TicketPercent className="size-5" strokeWidth={2.25} />
            <span className="font-marker text-[0.7rem] uppercase tracking-[0.18em] [writing-mode:vertical-rl] rotate-180">
              {valueLabel} off
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

function TimeCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="flex min-w-[3rem] items-center justify-center rounded-lg bg-darkroom px-2 py-1.5 text-lg font-bold tabular-nums text-kodak">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[0.6rem] uppercase tracking-[0.12em] text-darkroom/50">
        {label}
      </span>
    </div>
  );
}

function Colon() {
  return (
    <span className="flex items-center pb-4 text-lg font-bold text-darkroom/40">
      :
    </span>
  );
}
