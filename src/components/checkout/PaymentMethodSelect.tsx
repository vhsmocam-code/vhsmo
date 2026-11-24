"use client";

import { CreditCard, Truck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { COD_FEE_DISPLAY } from "@/lib/cod/fee";

export type PaymentChoice = "prepaid" | "cod";

export type CodAvailability = { available: true } | { available: false; reason: string };

type Props = {
  value: PaymentChoice;
  onChange: (value: PaymentChoice) => void;
  cod: CodAvailability;
  /** What the shopper would pay in cash, fee included. */
  codTotal: number;
  disabled?: boolean;
};

/** Two radio cards: pay online, or Cash on Delivery (+₹100). */
export function PaymentMethodSelect({ value, onChange, cod, codTotal, disabled }: Props) {
  return (
    <fieldset className="mt-5" disabled={disabled}>
      <legend className="mb-2.5 text-sm font-bold text-darkroom">Payment method</legend>
      <div role="radiogroup" className="space-y-2.5">
        <Option
          checked={value === "prepaid"}
          onSelect={() => onChange("prepaid")}
          icon={<CreditCard className="size-4" />}
          title="Pay online"
          subtitle="UPI, cards, net banking · coupons apply"
        />
        <Option
          checked={value === "cod"}
          onSelect={() => cod.available && onChange("cod")}
          disabled={!cod.available}
          icon={<Truck className="size-4" />}
          title="Cash on Delivery"
          badge={`+${formatCurrency(COD_FEE_DISPLAY)} COD fee`}
          subtitle={
            cod.available
              ? `Pay ${formatCurrency(codTotal)} in cash or UPI when it arrives`
              : cod.reason
          }
        />
      </div>
    </fieldset>
  );
}

function Option({
  checked,
  onSelect,
  disabled,
  icon,
  title,
  subtitle,
  badge,
}: {
  checked: boolean;
  onSelect: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-disabled={disabled}
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-colors ${
        disabled
          ? "cursor-not-allowed border-darkroom/10 bg-darkroom/[0.03] opacity-60"
          : checked
            ? "border-bluehour bg-bluehour/[0.06]"
            : "border-darkroom/12 hover:border-darkroom/25"
      }`}
    >
      <span
        aria-hidden
        className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
          checked ? "border-bluehour" : "border-darkroom/25"
        }`}
      >
        {checked && <span className="size-2.5 rounded-full bg-bluehour" />}
      </span>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-darkroom/[0.06] text-darkroom/60">
        {icon}
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-bold text-darkroom">{title}</span>
          {badge && (
            <span className="rounded-full bg-kodak/60 px-2 py-0.5 text-[11px] font-bold text-darkroom">
              {badge}
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-xs text-darkroom/55">{subtitle}</span>
      </span>
    </button>
  );
}
