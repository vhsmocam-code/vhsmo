"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  done: boolean;
};

function getTimeLeft(target: number): TimeLeft {
  const diff = target - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, done: true };

  const totalMinutes = Math.floor(diff / 60000);
  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
    done: false,
  };
}

export function RestockBanner() {
  const reduceMotion = useReducedMotion();
  const target = useMemo(() => new Date("2026-11-25T18:00:00+05:30").getTime(), []);
  const [time, setTime] = useState<TimeLeft>(() => getTimeLeft(target));

  useEffect(() => {
    const tick = () => setTime(getTimeLeft(target));
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (time.done) return null;

  return (
    <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="relative z-40 flex min-h-14 w-full flex-col items-center justify-center gap-2 overflow-hidden border-b-2 border-darkroom bg-kodak px-4 py-3.5 text-center text-darkroom shadow-[0_3px_0_rgba(42,36,34,0.14)] sm:min-h-16 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-2 sm:px-12 sm:py-4"
          role="status"
          aria-label="Restock announcement"
        >
          <span className="font-marker inline-flex items-center gap-2 rounded-sm bg-darkroom px-2.5 py-1.5 text-sm leading-none text-kodak sm:text-base">
            <motion.span
              aria-hidden="true"
              animate={reduceMotion ? undefined : { scale: [1, 1.25, 1] }}
              transition={reduceMotion ? undefined : { duration: 1.8, repeat: Infinity }}
              className="size-1.5 rounded-full bg-kodak sm:size-2"
            />
            Restock alert
          </span>
          <span className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span className="text-xs font-semibold leading-tight tracking-tight sm:whitespace-nowrap sm:text-base">
              New stock lands <span className="font-marker text-base sm:text-xl">25 Nov 2026, 6 PM IST</span>
            </span>
            <span
              className="whitespace-nowrap border-l-2 border-darkroom pl-2 font-marker text-sm leading-none sm:pl-3 sm:text-lg"
              aria-label={`${time.days} days, ${time.hours} hours, ${time.minutes} minutes remaining`}
            >
              in {time.days}d {time.hours}h {time.minutes}m
            </span>
          </span>
    </motion.div>
  );
}
