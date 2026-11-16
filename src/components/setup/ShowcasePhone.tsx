"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { TourScreen } from "@/lib/setup";
import { cn } from "@/lib/utils";
import s from "./AppShowcase.module.css";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * One phone showing the real app screens. Only the screen for `index` is
 * visible; the others stay mounted underneath so a change never flashes.
 * Yellow rings point out the buttons that matter on each screen. Nothing
 * here is clickable: the page's scroll position picks the screen.
 */
export function ShowcasePhone({
  screens,
  index,
  reduce,
  className,
}: {
  screens: TourScreen[];
  index: number;
  reduce: boolean;
  className?: string;
}) {
  const screen = screens[index]!;

  return (
    <div className={cn("@container relative mx-auto", className)}>
      {/* Glow that takes on each screen's colour */}
      <div
        aria-hidden
        className={cn(s.glow, "absolute -inset-[22%] rounded-full opacity-35 blur-3xl")}
        style={{ backgroundColor: screen.glow }}
      />

      <div className={reduce ? undefined : s.float}>
        <div className="relative rounded-[15cqw] bg-[#0b0a09] p-[2.7cqw] shadow-[0_2.4rem_4rem_-1rem_rgba(0,0,0,0.7)] ring-1 ring-white/10">
          <div className="@container relative aspect-[1320/2868] overflow-hidden rounded-[12.5cqw] bg-darkroom-deep">
            {screens.map((sc, i) => {
              const on = i === index;
              return (
                <motion.div
                  key={sc.id}
                  className="absolute inset-0"
                  initial={false}
                  animate={{ opacity: on ? 1 : 0, y: on ? 0 : i < index ? -18 : 18, scale: on ? 1 : 0.985 }}
                  transition={{ duration: reduce ? 0 : 0.55, ease: EASE }}
                  aria-hidden={!on}
                >
                  <Image
                    src={sc.src}
                    alt={on ? sc.alt : ""}
                    fill
                    priority={i === 0}
                    draggable={false}
                    sizes="(min-width: 1024px) 20rem, 68vw"
                    className="select-none object-cover"
                  />
                </motion.div>
              );
            })}

            {/* Rings around the buttons that matter on this screen */}
            <AnimatePresence initial={false}>
              {screen.highlights.map((h, i) => (
                <motion.span
                  key={`${screen.id}-${i}`}
                  aria-hidden
                  className={s.ring}
                  style={{
                    left: `${h.x}%`,
                    top: `${h.y}%`,
                    width: `${h.w}cqw`,
                    height: `${h.h}cqw`,
                    borderRadius: h.r === undefined ? 9999 : `${h.r}cqw`,
                    x: "-50%",
                    y: "-50%",
                  }}
                  initial={{ opacity: 0, scale: 1.12 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: reduce ? 0 : 0.45, delay: reduce ? 0 : 0.3 + i * 0.18, ease: EASE }}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
