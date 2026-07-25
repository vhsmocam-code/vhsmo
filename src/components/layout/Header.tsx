"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { flyToCart } from "@/lib/fly-to-cart";
import { cn } from "@/lib/utils";
import { RESERVE_HREF } from "@/lib/landing";
import { useDefaultProduct } from "@/lib/products-context";

const navLinks = [
  { label: "Shop", href: RESERVE_HREF },

  { label: "Story", href: "/#story" },
  { label: "Shot on VHSMO", href: "/#photos" },
  { label: "FAQ", href: "/#faq" },
];

export function Header() {
  const { count, openCart, isHydrated, addItem } = useCart();
  // The header sells the first in-stock finish from the products table, so
  // its Reserve merges into the same cart line as the panel's.
  const product = useDefaultProduct();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Reserve = drop the camera in the cart (addItem also opens the drawer).
  // When triggered from a visible button, fly the product to the cart first.
  const reserve = async (source?: HTMLElement | null) => {
    if (!product || product.stock <= 0) return;
    const image = product.images[0]!.src;
    if (source) await flyToCart(source, image);
    addItem({
      id: product.id,
      name: product.name,
      variant: product.color,
      price: product.price,
      image,
    });
  };

  // Pages that open on a light (paper) surface need dark nav until the
  // header picks up its dark backdrop on scroll.
  const lightTop =
    !!pathname &&
    (pathname.startsWith("/product") ||
      pathname.startsWith("/checkout") ||
      pathname.startsWith("/legal"));
  const darkText = lightTop && !scrolled;

  // On light-surface pages (policy pages, the checkout success page) the white
  // wordmark is invisible against the paper until the header picks up its dark
  // backdrop on scroll, so show the brown mark at the top and swap to the white
  // mark once scrolled.
  const brownLogoTop =
    !!pathname &&
    !scrolled &&
    (pathname.startsWith("/legal") ||
      pathname.startsWith("/checkout/success"));
  const logo = brownLogoTop
    ? { src: "/brownTrans.png", width: 748, height: 679 }
    : { src: "/whiteTrans.png", width: 748, height: 679 };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[var(--ease-out-expo)]",
        // iOS Safari's top rubber-band bounce (worst on first entry from a
        // Google result, which lands mid-page) drags this fixed header down
        // and leaks page content above the marquee. overscroll-behavior is
        // ignored by iOS for the document scroller, so we bleed the marquee's
        // colour a full viewport-height up past the top edge: no matter how
        // hard the bounce overshoots, the exposed gap is always yellow, never
        // the page behind it. The filler sits off-screen until a bounce.
        "before:pointer-events-none before:absolute before:inset-x-0 before:bottom-full before:h-screen before:bg-kodak before:content-['']",
        darkText ? "text-darkroom" : "text-halide",
        scrolled
          ? "border-b border-halide/10 bg-darkroom/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="shell flex h-16 items-center justify-between sm:h-20">
        <Link
          href="/"
          aria-label="VHSMO home"
          className="-rotate-2 leading-none transition-transform hover:rotate-0"
        >
          <Image
            src={logo.src}
            alt="VHSMO"
            width={logo.width}
            height={logo.height}
            priority
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "text-[0.9rem] font-medium transition-colors",
                darkText
                  ? "text-darkroom/80 hover:text-darkroom"
                  : "text-halide/85 hover:text-kodak",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
        
          <button
            type="button"
            data-cart-icon
            onClick={openCart}
            aria-label={`Open cart${isHydrated && count > 0 ? ` (${count} items)` : ""}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-halide/10"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden />
            {isHydrated && count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-kodak text-[0.65rem] font-bold text-darkroom"
              >
                {count}
              </motion.span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-halide/10 md:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
    </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex flex-col bg-darkroom md:hidden"
          >
            <div className="container-px flex h-16 items-center justify-between">
              <Image
                src="/yellowLogo.png"
                alt="VHSMO"
                width={2311}
                height={679}
                className="h-6 w-auto -rotate-2"
              />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-full text-halide hover:bg-halide/10"
              >
                <X className="h-6 w-6" aria-hidden />
              </button>
            </div>
            <nav
              aria-label="Mobile"
              className="container-px flex flex-1 flex-col justify-center gap-2"
            >
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="display block py-3 text-4xl text-overexpose transition-colors hover:text-kodak"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-8"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    reserve();
                  }}
                  className="font-marker inline-block -rotate-2 bg-kodak px-8 py-4 text-2xl text-darkroom"
                >
                  Reserve yours →
                </button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
