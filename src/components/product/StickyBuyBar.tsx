"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bell } from "lucide-react";
import { useColor } from "@/lib/color-context";
import { formatCurrency } from "@/lib/utils";
import { useOrderNow } from "@/components/product/useOrderNow";

/**
 * Phone-only buy bar for the product page. Slides up once the purchase
 * panel's own button has scrolled off the top, so the price and Order Now
 * stay one thumb away through the specs and FAQ; slides away again when the
 * panel's button is back on screen.
 */
export function StickyBuyBar({ source }: { source: string }) {
  const { variant } = useColor();
  const { orderNow, adding } = useOrderNow(variant, source);
  const reduceMotion = useReducedMotion();
  const [show, setShow] = useState(false);

  // The panel swaps its button when a finish sells out, so re-find it on
  // every finish change rather than holding one node forever.
  useEffect(() => {
    const target = document.querySelector<HTMLElement>("[data-order-now]");
    if (!target) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      // Only once it's gone off the top - not while it's still below the fold
      // on first load.
      setShow(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
    });
    io.observe(target);
    return () => io.disconnect();
  }, [variant?.id, variant?.stock]);

  if (!variant) return null;
  const soldOut = variant.stock <= 0;
  const thumb = variant.images[0]!;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { y: "110%" }}
          animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { y: "110%" }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-darkroom/15 bg-overexpose/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-0.5rem_1.5rem_rgba(31,26,24,0.12)] backdrop-blur lg:hidden"
        >
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-halide/60">
              <Image src={thumb.src} alt="" fill sizes="48px" className="object-contain" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-darkroom">
                {variant.color}
              </span>
              <span className="block text-sm text-darkroom/70">
                {soldOut ? "Sold out" : formatCurrency(variant.price)}
              </span>
            </span>
            {soldOut ? (
              <button
                onClick={() =>
                  document
                    .querySelector("[data-order-now]")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" })
                }
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-darkroom px-5 py-3 text-sm font-bold text-overexpose active:scale-[0.98]"
              >
                <Bell className="size-4" />
                Notify me
              </button>
            ) : (
              <button
                onClick={(e) => void orderNow(e.currentTarget)}
                disabled={adding}
                className="shrink-0 rounded-full bg-kodak px-6 py-3 text-sm font-bold text-darkroom active:scale-[0.98] disabled:bg-darkroom/15 disabled:text-darkroom/50"
              >
                {adding ? "Adding…" : "Order Now"}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
