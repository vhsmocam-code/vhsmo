"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "kodak" | "outline";
  className?: string;
};

/**
 * The reserve CTA. Leans toward the cursor within its hover zone and
 * presses down on click - tactile, like a shutter button.
 */
export function MagneticButton({
  href,
  children,
  variant = "kodak",
  className,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18 });
  const sy = useSpring(y, { stiffness: 220, damping: 18 });

  function onMouseMove(e: React.MouseEvent) {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.28);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.28);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="inline-block shrink-0 p-3 -m-3"
    >
      <motion.div style={{ x: sx, y: sy }} whileTap={{ scale: 0.95 }}>
        <Link
          href={href}
          className={cn(
            "inline-flex items-center gap-3 whitespace-nowrap rounded-full px-8 py-4 text-base font-bold tracking-tight transition-shadow sm:px-10 sm:py-5 sm:text-lg",
            variant === "kodak"
              ? "bg-kodak text-darkroom shadow-[0_0_0_0_rgba(253,241,0,0.4)] hover:shadow-[0_0_0_6px_rgba(253,241,0,0.25)]"
              : "border-2 border-current text-current hover:bg-halide/10",
            className,
          )}
        >
          {children}
        </Link>
      </motion.div>
    </div>
  );
}
