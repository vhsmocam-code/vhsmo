"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Fixed-ratio frame with a quiet image reveal: the print opens up from a
 * slightly inset crop and settles. The ratio is set up-front so media
 * loading in never shifts the layout.
 */
export function MediaFrame({
  ratio,
  bare,
  className,
  children,
}: {
  ratio: string;
  /** No background, radius or clipping - for transparent product cut-outs. */
  bare?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={
        reduce || bare
          ? false
          : { clipPath: "inset(8% 6% 8% 6% round 1.25rem)", opacity: 0, scale: 1.03 }
      }
      whileInView={
        bare
          ? undefined
          : { clipPath: "inset(0% 0% 0% 0% round 1.25rem)", opacity: 1, scale: 1 }
      }
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      style={{ aspectRatio: ratio }}
      className={cn(
        "relative w-full",
        !bare && "overflow-hidden rounded-[1.25rem] bg-darkroom-deep",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
