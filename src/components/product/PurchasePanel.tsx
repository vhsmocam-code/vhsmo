"use client";

import { useState } from "react";
import { Check, ShieldCheck, Truck } from "lucide-react";
import { productCopy } from "@/lib/products";
import { useColor } from "@/lib/color-context";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { flyToCart } from "@/lib/fly-to-cart";
import { Scribble } from "@/components/brand/Scribble";
import { instantTransfer } from "@/lib/landing";
import { track } from "@vercel/analytics";

/** Apple logo, for the App Store badge. */
function AppleLogo() {
  return (
    <svg aria-hidden viewBox="0 0 384 512" className="h-5 w-5 fill-current">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

/** Google Play glyph, for the Play Store badge. */
function PlayLogo() {
  return (
    <svg aria-hidden viewBox="0 0 512 512" className="h-5 w-5">
      <path fill="#2196F3" d="M99.6 32.7 325 258.1 99.6 483.5c-9.9-5.2-16.6-15.6-16.6-27.6V60.3c0-12 6.7-22.4 16.6-27.6z" />
      <path fill="#FFC107" d="m396.7 186.6 65.9 38.1c20.5 11.8 20.5 41.5 0 53.3l-65.9 38.1-71.7-58 71.7-71.5z" />
      <path fill="#4CAF50" d="M99.6 32.7c3.8-2 8.1-3.2 12.9-3.2 5.5 0 11.1 1.5 16.3 4.5l267.9 152.6-71.7 71.5L99.6 32.7z" />
      <path fill="#F44336" d="M325 258.1 396.7 316 128.8 468.6c-5.2 3-10.8 4.5-16.3 4.5-4.8 0-9.1-1.2-12.9-3.2L325 258.1z" />
    </svg>
  );
}

export function PurchasePanel() {
  const { addItem } = useCart();
  const { color, setColor, variants, variant } = useColor();
  const [adding, setAdding] = useState(false);

  // Nothing active in the products table - say so rather than render a
  // buy button that can't be honoured.
  if (!variant) {
    return (
      <div className="lg:sticky lg:top-28">
        <h1 className="display mt-6 text-[clamp(2.2rem,4vw,3.25rem)] text-darkroom">
          VHSMO
        </h1>
        <p className="font-marker mt-2 text-xl text-darkroom/70">
          Reservations are closed right now - check back shortly.
        </p>
      </div>
    );
  }

  // Whatever finish is on the stage is what flies to the cart.
  const hero = variant.images[0]!;
  const soldOut = variant.stock <= 0;
  const lowStock = !soldOut && variant.stock <= productCopy.lowStockThreshold;

  // Fly the product image to the cart icon, then land the item in the cart
  // (addItem opens the drawer once the flight ends). The cart line carries
  // the row id, so checkout resolves back to this exact SKU.
  const reserve = async (button: HTMLElement) => {
    if (adding || soldOut) return;
    setAdding(true);
    await flyToCart(button, hero.src);
    addItem({
      id: variant.id,
      name: variant.name,
      variant: variant.color,
      price: variant.price,
      image: hero.src,
    });
    setAdding(false);
  };
  const discount =
    variant.mrp > variant.price
      ? Math.round(((variant.mrp - variant.price) / variant.mrp) * 100)
      : 0;

  return (
    <div className="lg:sticky lg:top-28">
      {/* Running head */}
      {/* <div className="eyebrow flex items-center justify-between border-b border-darkroom/15 pb-3 text-darkroom/50">
        <span>The object</span>
        <span className="flex items-center gap-1.5">
          <span className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-3.5 fill-kodak text-kodak" />
            ))}
          </span>
          4.9 · 1,248
        </span>
      </div> */}

      <h1 className="display mt-6 text-[clamp(2.2rem,4vw,3.25rem)] text-darkroom">
        {variant.name}
      </h1>
      <p className="font-marker mt-2 text-xl text-darkroom/70 sm:text-2xl">
        {variant.description || productCopy.tagline}
      </p>

      {/* Price */}
      <div className="mt-6 flex items-baseline gap-3">
        <span className="relative inline-block">
          <span className="display text-4xl text-darkroom">
            {formatCurrency(variant.price)}
          </span>
          <Scribble className="absolute -bottom-2 left-0 h-2.5 w-full" />
        </span>
        {variant.mrp > variant.price && (
          <span className="text-lg text-darkroom/45 line-through">
            {formatCurrency(variant.mrp)}
          </span>
        )}
        {discount > 0 && (
          <span className="font-marker -rotate-2 bg-kodak px-2 py-0.5 text-sm text-darkroom">
            {discount}% off
          </span>
        )}
      </div>

      {/* Free shipping / returns */}
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-darkroom/70">
        <span className="flex items-center gap-2">
          <Truck className="size-4" /> Free shipping
        </span>
        <span className="flex items-center gap-2">
          <ShieldCheck className="size-4" /> 12-month defect warranty
        </span>
      </div>

      {/* What it is */}
      <ul className="mt-6 space-y-2.5">
        {productCopy.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2.5 text-[0.95rem] text-darkroom/85">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-bluehour">
              <Check className="size-3 text-overexpose" strokeWidth={3} />
            </span>
            {h}
          </li>
        ))}
      </ul>

      <div className="my-6 h-px bg-darkroom/15" />

      {/* Color */}
      <div>
        <p className="text-sm font-semibold text-darkroom">
          Finish:{" "}
          <span className="font-normal text-darkroom/60">{variant.color}</span>
        </p>
        <div className="mt-3 flex gap-3">
          {variants.map((c) => (
            <button
              key={c.id}
              onClick={() => setColor(c.id)}
              aria-pressed={color === c.id}
              aria-label={
                c.stock > 0 ? c.color : `${c.color} - out of stock`
              }
              title={c.stock > 0 ? c.color : `${c.color} - out of stock`}
              className={`relative flex size-10 items-center justify-center rounded-full border-2 transition-all ${
                color === c.id ? "border-darkroom" : "border-darkroom/20"
              } ${c.stock > 0 ? "" : "opacity-45"}`}
            >
              <span
                className="size-6 rounded-full ring-1 ring-darkroom/10"
                style={{ background: c.swatch }}
              />
              {/* Sold-out finishes stay pickable - the panel explains why */}
              {c.stock <= 0 && (
                <span className="pointer-events-none absolute h-px w-7 rotate-45 bg-darkroom/70" />
              )}
            </button>
          ))}
        </div>

        {/* Stock, straight off the row */}
        <p className="mt-3 text-sm">
          {soldOut ? (
            <span className="font-semibold text-darkroom/60">
              {variant.color} is sold out - pick another finish.
            </span>
          ) : lowStock ? (
            <span className="font-semibold text-darkroom">
              Only {variant.stock} left in {variant.color}.
            </span>
          ) : (
            <span className="text-darkroom/60">
            </span>
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-7">
        <button

      onClick={(e) => {
  track("reserve_clicked", {
    source: "product_page",
  });

  void reserve(e.currentTarget);
}}
          disabled={adding || soldOut}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-kodak px-8 py-4 text-base font-bold tracking-tight text-darkroom transition-all duration-300 ease-[var(--ease-out-expo)] hover:shadow-[0_0_0_5px_rgba(253,241,0,0.25)] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-darkroom/15 disabled:text-darkroom/50 disabled:shadow-none"
        >
          {soldOut ? "Sold out" : adding ? "Adding…" : "Pre Order Now"}
        </button>
      </div>

      {/* Refundable note */}
      <p className="mt-4 flex items-start gap-2.5 border-l-2 border-kodak bg-kodak/10 px-4 py-3 text-sm text-darkroom/80">
        <span>
          Pre-orders ship by{" "}
          <strong className="font-bold text-darkroom">late August</strong> as
          part of VHSMO&rsquo;s first production run. To thank our early
          supporters, you can reserve yours for{" "}
          <strong className="font-bold text-darkroom">₹4,999</strong> while
          pre-order stock lasts. Once sold out, the price goes back to{" "}
          <strong className="font-bold text-darkroom">₹6,999</strong>.
        </span>
      </p>

      {/* Reserve CTA line */}
      <p className="mt-2.5 flex items-start gap-2.5 rounded-xl border-l-2 border-bluehour bg-bluehour/[0.08] px-4 py-3 text-sm font-semibold text-darkroom">
    
        <span>
          Lock in the launch price-
          <strong className="font-bold">fully refundable</strong> if not shipped
          by <strong className="font-bold">15th September 2026</strong>.
        </span>
      </p>

      {/* The app, in one breath - pairs with the camera instead of its own section */}
      <div className="mt-8 rounded-2xl bg-darkroom/[0.06] p-5">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[22%] bg-darkroom-deep shadow-[0.15rem_0.3rem_0.6rem_rgba(31,26,24,0.35)]">
            <span className="font-marker -rotate-3 text-[0.7rem] text-kodak">VHSMO</span>
          </span>
          <div>
            <h3 className="font-bold text-darkroom">{instantTransfer.app.name}</h3>
            <p className="mt-0.5 text-sm leading-snug text-darkroom/75">
              {instantTransfer.app.description}
            </p>
          </div>
        </div>
        {/* Badges are inert until the app ships - nothing to link to yet */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <span className="flex items-center gap-2 rounded-lg bg-darkroom-deep/60 px-3 py-3 text-overexpose/70">
            <AppleLogo />
            <span className="leading-tight">
              <span className="block text-sm font-semibold">App Store</span>
            </span>
          </span>
          <span className="flex items-center gap-2 rounded-lg bg-darkroom-deep/60 px-3 py-3 text-overexpose/70">
            <PlayLogo />
            <span className="leading-tight">
              <span className="block text-sm font-semibold">Google Play</span>
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
