"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function CheckoutHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky inset-x-0 top-0 z-30 transition-all duration-500 ease-[var(--ease-out-expo)]",
        scrolled
          ? "border-b border-halide/10 bg-darkroom/85 text-halide backdrop-blur-xl"
          : "border-b border-transparent bg-transparent text-darkroom",
      )}
    >
      <div className="container-px mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="Back to store"
          className={cn(
            "tap-target flex items-center gap-2 text-sm font-semibold transition-colors",
            scrolled
              ? "text-halide/70 hover:text-halide"
              : "text-darkroom/60 hover:text-darkroom",
          )}
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Back to store</span>
        </Link>

        {/* Wordmark */}
        <Link
          href="/"
          aria-label="VHSMO - home"
          className="flex select-none flex-col items-center leading-none"
        >
          <span
            className={cn(
              "font-marker text-3xl leading-none transition-colors",
              scrolled ? "text-kodak" : "text-darkroom",
            )}
          >
            VHSMO
          </span>
        </Link>

        <span
          className={cn(
            "flex items-center gap-1.5 text-sm font-semibold transition-colors",
            scrolled ? "text-halide/70" : "text-darkroom/60",
          )}
        >
          <ShieldCheck className="size-4 text-bluehour" />
          <span className="hidden sm:inline">Secure Checkout</span>
        </span>
      </div>
    </header>
  );
}
