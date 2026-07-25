"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useDefaultProduct } from "@/lib/products-context";

export function EmptyCart() {
  const product = useDefaultProduct();

  return (
    <div className="container-px mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center sm:py-32">
      <span className="flex size-16 items-center justify-center rounded-full bg-overexpose shadow-[0_1px_2px_rgba(31,26,24,0.08)]">
        <ShoppingBag className="size-7 text-darkroom/50" />
      </span>
      <h1 className="display mt-8 text-[clamp(1.8rem,4vw,2.5rem)] text-darkroom">
        Your cart is empty.
      </h1>
      <p className="mt-4 max-w-sm text-base text-darkroom/60">
        Pre Order your VHSMO to lock in the early price, then check out here.
      </p>
      <Link
        href="/#reserve"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-kodak px-7 py-3.5 text-sm font-bold text-darkroom transition-transform hover:scale-[1.02]"
      >
        {product ? `Pre Order Now - ${formatCurrency(product.price)}` : "Pre Order Now"}
      </Link>
    </div>
  );
}
