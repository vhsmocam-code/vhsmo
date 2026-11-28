"use client";

import { useCallback, useState } from "react";
import { track } from "@vercel/analytics";
import type { ProductVariant } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { flyToCart } from "@/lib/fly-to-cart";

/**
 * The one "Order Now" code path, shared by the purchase panel and the
 * product page's sticky phone bar: fly the finish's hero shot to the cart
 * icon, then land the line in the cart (addItem opens the drawer once the
 * flight ends). The line carries the Supabase row id, so checkout resolves
 * back to this exact SKU.
 */
export function useOrderNow(variant: ProductVariant | undefined, source: string) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);

  const orderNow = useCallback(
    async (button: HTMLElement) => {
      if (!variant || adding || variant.stock <= 0) return;
      track("reserve_clicked", { source });
      setAdding(true);
      const hero = variant.images[0]!;
      await flyToCart(button, hero.src);
      addItem({
        id: variant.id,
        name: variant.name,
        variant: variant.color,
        price: variant.price,
        image: hero.src,
      });
      setAdding(false);
    },
    [variant, adding, source, addItem],
  );

  return { orderNow, adding };
}
