"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { RESERVE_HREF } from "@/lib/landing";

/** The yellow band above the navbar: "we're back in stock" + a way to buy. */
export function BackInStockBanner() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative z-40 flex min-h-14 w-full flex-col items-center justify-center gap-2 overflow-hidden border-b-2 border-darkroom bg-kodak px-4 py-3 text-center text-darkroom shadow-[0_3px_0_rgba(42,36,34,0.14)] sm:min-h-16 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-2 sm:px-12 sm:py-3.5"
      role="status"
      aria-label="Back in stock"
    >
      <span className="font-marker inline-flex items-center gap-2 rounded-sm bg-darkroom px-2.5 py-1.5 text-sm leading-none text-kodak sm:text-base">
        <motion.span
          aria-hidden="true"
          animate={reduceMotion ? undefined : { scale: [1, 1.25, 1] }}
          transition={reduceMotion ? undefined : { duration: 1.8, repeat: Infinity }}
          className="size-1.5 rounded-full bg-kodak sm:size-2"
        />
        Back in stock
      </span>
      <span className="text-sm font-semibold leading-tight tracking-tight sm:text-base">
        We&apos;re back in stock!{" "}
        <span className="font-normal">Grab yours before it sells out again.</span>
      </span>
      <Link
        href={RESERVE_HREF}
        className="font-marker inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-darkroom px-4 py-1 text-sm leading-none transition-colors hover:bg-darkroom hover:text-kodak sm:text-base"
      >
        Shop now →
      </Link>
    </motion.div>
  );
}
