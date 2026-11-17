"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
  label?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  size = "md",
  className,
  label = "Quantity",
}: QuantityStepperProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  const btn =
    "flex items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/[0.06] disabled:opacity-30 disabled:hover:bg-transparent";
  const dims = size === "sm" ? "tap-target size-8" : "tap-target size-10";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-line bg-canvas p-1",
        className,
      )}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        className={cn(btn, dims)}
        aria-label="Decrease quantity"
      >
        <Minus className="size-4" />
      </button>
      <span
        className={cn(
          "min-w-8 text-center font-medium tabular-nums",
          size === "sm" ? "text-sm" : "text-base",
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        className={cn(btn, dims)}
        aria-label="Increase quantity"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
