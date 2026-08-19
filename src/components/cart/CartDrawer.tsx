"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, PackageX, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useProducts } from "@/lib/products-context";
import { formatCurrency } from "@/lib/utils";
import { QuantityStepper } from "@/components/common/QuantityStepper";
import { Button } from "@/components/ui/button";
import { track } from "@vercel/analytics";

const EASE = [0.16, 1, 0.3, 1] as const;

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    setQuantity,
    removeItem,
    subtotal,
    tax,
    shipping,
    total,
    count,
  } = useCart();

  // Live Supabase stock, keyed by product row id. Any cart line whose backend
  // stock is 0 (or whose row is gone) blocks checkout until it's removed.
  const products = useProducts();
  const soldOutIds = useMemo(() => {
    const stockById = new Map(products.map((p) => [p.id, p.stock]));
    const out = new Set<string>();
    for (const item of items) {
      const stock = stockById.get(item.id);
      if (stock !== undefined && stock <= 0) out.add(item.id);
    }
    return out;
  }, [products, items]);
  const hasSoldOut = soldOutIds.size > 0;

  // Body scroll lock + escape to close.
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[80]"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={closeCart}
            className="absolute inset-0 bg-darkroom-deep/40 backdrop-blur-[2px]"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="absolute right-0 top-0 flex h-dvh w-full max-w-[440px] flex-col bg-halide text-darkroom shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-darkroom/12 px-6 py-5">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="size-5" />
                <h2 className="text-lg font-bold text-darkroom">
                  Your cart{" "}
                  <span className="font-normal text-darkroom/55">
                    ({count})
                  </span>
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="flex size-10 items-center justify-center rounded-full text-darkroom transition-colors hover:bg-darkroom/[0.06]"
                aria-label="Close cart"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-overexpose">
                  <ShoppingBag className="size-7 text-darkroom/50" />
                </div>
                <p className="mt-5 text-lg font-bold text-darkroom">
                  Your cart is empty
                </p>
                <p className="mt-1.5 text-sm text-darkroom/60">
                  Reserve your VHSMO to lock in the early price.
                </p>
                <Button onClick={closeCart} variant="outline" className="mt-6">
                  Continue browsing
                </Button>
              </div>
            ) : (
              <ul className="flex-1 divide-y divide-darkroom/10 overflow-y-auto px-6 [scrollbar-width:thin]">
                {items.map((item) => {
                  const soldOut = soldOutIds.has(item.id);
                  return (
                  <li
                    key={`${item.id}-${item.variant ?? ""}`}
                    className="flex gap-4 py-5"
                  >
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-overexpose">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className={`object-cover transition ${
                          soldOut ? "opacity-40 grayscale" : ""
                        }`}
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold leading-snug text-darkroom">
                            {item.name}
                          </p>
                          {item.variant && (
                            <p className="text-xs text-darkroom/55">
                              {item.variant}
                            </p>
                          )}
                          {soldOut && (
                            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600 ring-1 ring-inset ring-red-500/25">
                              <PackageX className="size-3" />
                              Out of stock
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.variant)}
                          className="flex size-8 items-center justify-center rounded-full text-darkroom/55 transition-colors hover:bg-darkroom/[0.06] hover:text-darkroom"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <QuantityStepper
                          size="sm"
                          value={item.quantity}
                          onChange={(q) =>
                            setQuantity(item.id, q, item.variant)
                          }
                        />
                        <span
                          className={`font-semibold tabular-nums ${
                            soldOut ? "text-darkroom/40" : "text-darkroom"
                          }`}
                        >
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                  );
                })}
              </ul>
            )}

            {/* Summary */}
            {items.length > 0 && (
              <div className="border-t border-darkroom/12 bg-overexpose/60 px-6 py-5">
                <div className="space-y-2 text-sm">
                  <Row label="Subtotal" value={formatCurrency(subtotal)} />
                  <Row
                    label="Shipping"
                    value={shipping === 0 ? "Free" : formatCurrency(shipping)}
                  />
                  <Row
                    label="Tax"
                    value={tax !== 0 ? "Calculated at checkout" : "Included"}
                    muted
                  />
                  <div className="my-3 h-px bg-darkroom/12" />
                  <div className="flex items-center justify-between text-base font-bold text-darkroom">
                    <span>Total</span>
                    <span className="tabular-nums">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                {hasSoldOut ? (
                  <>
                    <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/[0.06] p-3">
                      <PackageX className="mt-0.5 size-4 shrink-0 text-red-600" />
                      <p className="text-xs font-semibold leading-snug text-red-700">
                        An item in your cart is out of stock. Remove it to
                        continue to checkout.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled
                      className="mt-3 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-darkroom/15 px-8 py-4 text-base font-bold tracking-tight text-darkroom/45"
                    >
                      <Lock className="size-4" />
                      Secure checkout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/checkout"
                    onClick={() => {
                      track("checkout_clicked", {
                        source: "cart_drawer",
                      });

                      closeCart();
                    }}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-bluehour px-8 py-4 text-base font-bold tracking-tight text-overexpose transition-all duration-300 ease-[var(--ease-out-expo)] hover:shadow-[0_0_0_5px_rgba(16,147,255,0.25)] active:scale-[0.98]"
                  >
                    <Lock className="size-4" />
                    Secure checkout
                  </Link>
                )}

                <div className="mt-3 flex items-center justify-center gap-4 text-xs text-darkroom/55">
                  <span className="flex items-center gap-1.5">
                    <Lock className="size-3.5" /> Encrypted
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Truck className="size-3.5" /> Free PAN India shipping
                  </span>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-darkroom/60">{label}</span>
      <span className={muted ? "text-xs text-darkroom/50" : "tabular-nums text-darkroom"}>
        {value}
      </span>
    </div>
  );
}
