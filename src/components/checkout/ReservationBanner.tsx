"use client";

import { Clock } from "lucide-react";

/**
 * A slim, sticky urgency banner shown beneath the checkout header. It counts
 * down the shopper's 10-minute reservation window to nudge them to finish.
 */
export function ReservationBanner({ label }: { label: string }) {
  return (
    <div className="sticky top-16 z-20 border-b border-kodak/30 bg-darkroom text-halide shadow-sm">
      <div className="container-px mx-auto flex h-11 max-w-[90rem] items-center justify-center gap-2 text-center text-sm font-semibold">
        <Clock className="size-4 shrink-0 text-kodak" />
        <span>
          VHSMO is reserved for you - complete your order within{" "}
          <span className="tabular-nums font-bold text-kodak">{label}</span>
        </span>
      </div>
    </div>
  );
}
