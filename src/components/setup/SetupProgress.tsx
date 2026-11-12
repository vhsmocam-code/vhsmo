"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Item = { id: string; number: string; label: string };

/**
 * Where-am-I indicator for the steps: a thin line across the top on small
 * screens and a slim numbered rail on wide ones. Clicks use the page's
 * normal #anchor scrolling (Lenis handles the easing).
 */
export function SetupProgress({ items }: { items: Item[] }) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [fraction, setFraction] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const els = items.map((it) => document.getElementById(it.id));
      const first = els[0];
      const last = els[els.length - 1];
      if (!first || !last) return;
      const firstTop = first.getBoundingClientRect().top;
      const lastBottom = last.getBoundingClientRect().bottom;
      setVisible(firstTop < vh * 0.55 && lastBottom > vh * 0.45);

      let idx = 0;
      els.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top < vh * 0.5) idx = i;
      });
      setActive(idx);

      const total = lastBottom - firstTop + 0; // page distance covered by steps
      const scrolled = vh * 0.5 - firstTop;
      setFraction(Math.min(1, Math.max(0, scrolled / Math.max(1, total))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  return (
    <>
      {/* Small screens: thin progress line */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 bg-halide/10 transition-opacity duration-300 2xl:hidden",
          visible ? "opacity-100" : "opacity-0",
        )}
      >
        <div
          className="h-full origin-left bg-kodak"
          style={{ transform: `scaleX(${fraction})` }}
        />
      </div>

      {/* Wide screens: numbered rail */}
      <nav
        aria-label="Setup steps"
        className={cn(
          "fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 transition-opacity duration-300 2xl:block",
          visible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ol className="flex flex-col items-end gap-2.5 rounded-full bg-darkroom-deep/80 px-3 py-4 shadow-[0_0.5rem_1.5rem_rgba(0,0,0,0.3)] backdrop-blur">
          {items.map((it, i) => (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                aria-label={`Step ${it.number}: ${it.label}`}
                aria-current={active === i ? "step" : undefined}
                className="group flex items-center gap-3"
              >
                <span
                  className={cn(
                    "text-xs font-semibold text-halide opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100",
                  )}
                >
                  {it.label}
                </span>
                <span
                  className={cn(
                    "font-marker w-7 text-right text-sm tabular-nums transition-colors duration-300",
                    active === i ? "text-kodak" : "text-halide/35 group-hover:text-halide",
                  )}
                >
                  {it.number}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
