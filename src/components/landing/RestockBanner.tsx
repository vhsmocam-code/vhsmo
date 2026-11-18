"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

const RESTOCK_AT = "2026-11-25T00:00:00";
const DISMISS_KEY = "vhsmo-restock-2026-11-25-dismissed";

type TimeLeft = { days: number; hours: number; minutes: number; done: boolean };

function getTimeLeft(target: number): TimeLeft {
  const diff = target - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, done: true };
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    done: false,
  };
}

export function RestockBanner() {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const target = useMemo(() => new Date(RESTOCK_AT).getTime(), []);

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [time, setTime] = useState<TimeLeft>(() => getTimeLeft(target));

  useEffect(() => {
    setMounted(true);
    if (getTimeLeft(target).done) return;
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      /* storage blocked - treat as not dismissed */
    }
    if (!dismissed) setVisible(true);
  }, [target]);

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      const next = getTimeLeft(target);
      setTime(next);
      if (next.done) setVisible(false);
    }, 60_000);
    return () => clearInterval(id);
  }, [visible, target]);

  const dismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* storage blocked - banner may re-show next load, that's fine */
    }
  };

  if (!mounted) return null;
  if (pathname !== "/") return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          role="status"
          aria-label="Restock announcement"
          initial={reduceMotion ? { opacity: 0 } : { y: "-100%" }}
          animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { y: "-100%" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-40 w-full bg-darkroom text-kodak"
        >
          <div className="shell flex items-center justify-between gap-3 py-2 text-[0.72rem] uppercase tracking-[0.18em] sm:text-xs">
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className={
                  reduceMotion
                    ? "inline-block size-1.5 rounded-full bg-kodak"
                    : "inline-block size-1.5 animate-pulse rounded-full bg-kodak"
                }
              />
              <span className="font-medium">
                Back in stock · Wed, 25 Nov 2026
              </span>
            </span>
            <span className="flex items-center gap-3">
              <span className="hidden tabular-nums text-kodak/80 sm:inline">
                {time.done
                  ? "Available now"
                  : `${time.days}d ${time.hours}h ${time.minutes}m`}
              </span>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss restock announcement"
                className="flex size-6 items-center justify-center rounded-full text-kodak/80 transition-colors hover:bg-kodak/10 hover:text-kodak"
              >
                <X className="size-3.5" />
              </button>
            </span>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
