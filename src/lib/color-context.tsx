"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { variantFor, type ProductVariant } from "@/lib/products";
import { useProducts } from "@/lib/products-context";

interface ColorContextValue {
  /** The selected row's id, or "" when the table has nothing to sell. */
  color: string;
  setColor: (id: string) => void;
  /** Every active finish from Supabase, in swatch order. */
  variants: ProductVariant[];
  /** The selected finish, or undefined when there is nothing to sell. */
  variant: ProductVariant | undefined;
}

const ColorContext = createContext<ColorContextValue | null>(null);

/**
 * Holds the selected body colour for the reserve section. The swatch row lives
 * in the purchase panel but the photo gallery sits in the other column, so the
 * choice has to be shared rather than owned by either one.
 *
 * The finishes themselves are the Supabase rows - the first one still in stock
 * opens selected, so nobody lands on a sold-out colour.
 */
export function ColorProvider({
  children,
  initialId,
  onChange,
}: {
  children: React.ReactNode;
  /** Open on this row instead of the first in-stock one - the product page
   *  passes the finish its URL names, even when that finish is sold out. */
  initialId?: string;
  /** Called after a swatch pick (not on first render). */
  onChange?: (variant: ProductVariant) => void;
}) {
  const variants = useProducts();
  const initial =
    (initialId && variants.find((v) => v.id === initialId)) ||
    variants.find((v) => v.stock > 0) ||
    variants[0];
  const [color, setColorState] = useState<string>(initial?.id ?? "");

  // Read through a ref so a parent passing an inline callback doesn't
  // rebuild the context value (and re-render every consumer) each render.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setColor = useCallback(
    (id: string) => {
      setColorState(id);
      const next = variants.find((v) => v.id === id);
      if (next) onChangeRef.current?.(next);
    },
    [variants],
  );

  const value = useMemo(
    () => ({
      color,
      setColor,
      variants,
      variant: variantFor(variants, color),
    }),
    [color, setColor, variants],
  );
  return <ColorContext.Provider value={value}>{children}</ColorContext.Provider>;
}

export function useColor() {
  const ctx = useContext(ColorContext);
  if (!ctx) throw new Error("useColor must be used inside a ColorProvider");
  return ctx;
}
