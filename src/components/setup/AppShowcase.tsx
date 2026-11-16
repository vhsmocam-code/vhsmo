"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { appGuide } from "@/lib/setup";
import { cn } from "@/lib/utils";
import { ShowcasePhone } from "./ShowcasePhone";
import s from "./AppShowcase.module.css";

const EASE = [0.16, 1, 0.3, 1] as const;
/** Scroll (in svh) each screen stays up for. */
const PER_SCREEN = 70;

/**
 * Step 05's "Your camera, in your pocket": a phone that stays pinned while
 * the visitor scrolls, changing to the next real app screen as they go
 * (Home, Live Gallery, Your rolls, Favourites). Yellow rings point out the
 * buttons that matter. Nothing is clickable; scrolling is the only control.
 */
export function AppShowcase() {
  const screens = appGuide.tour;
  const n = screens.length;
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);

  // useReducedMotion is null on the server; trust it only after mount.
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduce = mounted && Boolean(prefersReduced);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = Math.min(n - 1, Math.max(0, Math.floor(p * n)));
    if (i !== indexRef.current) {
      indexRef.current = i;
      setIndex(i);
    }
  });

  const screen = screens[index]!;

  const heading = (
    <>
      <p className="eyebrow text-kodak">In the app</p>
      <h3 className="display mt-4 text-[clamp(1.9rem,3.6vw,3rem)] text-halide">Your camera, in your pocket.</h3>
    </>
  );

  return (
    <div className="mt-20 sm:mt-28">
      {/* Phones: the heading scrolls by normally, above the pinned phone */}
      <div className="text-center lg:hidden">{heading}</div>

      <div ref={ref} className="relative" style={{ height: `${n * PER_SCREEN + 100}svh` }}>
        <div className="sticky top-0 flex h-svh flex-col justify-center pb-4 pt-16 lg:pt-0 lg:pb-0">
          <div className="grid w-full grid-cols-12 items-center gap-y-3 lg:gap-x-16">
            {/* Laptops: heading and the four steps */}
            <div className="col-span-5 hidden lg:block">
              {heading}
              <div className="relative mt-10 h-px bg-halide/15">
                <ProgressLine progress={scrollYProgress} />
              </div>
              <ol aria-live="polite">
                {screens.map((sc, i) => {
                  const on = i === index;
                  return (
                    <li key={sc.id} className="border-b border-halide/15 py-5" aria-current={on ? "step" : undefined}>
                      <div className="flex items-baseline gap-4">
                        <span className={cn("font-marker text-xl tabular-nums transition-colors duration-500", on ? "text-kodak" : "text-halide/30")}>
                          {i + 1}
                        </span>
                        <span className={cn("text-lg font-semibold transition-colors duration-500", on ? "text-halide" : "text-halide/45")}>
                          {sc.title}
                        </span>
                      </div>
                      <AnimatePresence initial={false}>
                        {on && (
                          <motion.p
                            key="caption"
                            className="overflow-hidden pl-9 text-base leading-relaxed text-halide/75"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
                          >
                            <span className="block pt-2">{sc.caption}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* The phone */}
            <div className="col-span-12 lg:col-span-7">
              <ShowcasePhone screens={screens} index={index} reduce={reduce} className={s.phone} />
            </div>

            {/* Phones: caption and progress under the phone */}
            <div className="col-span-12 mx-auto w-full max-w-sm text-center lg:hidden">
              <div className="relative min-h-[5.25rem]" aria-live="polite">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={screen.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
                  >
                    <p className="text-base font-semibold text-halide">
                      <span className="font-marker mr-2 text-kodak">{index + 1}</span>
                      {screen.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-halide/70">{screen.caption}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="mx-auto mt-1 flex max-w-[12rem] gap-1.5" aria-hidden>
                {screens.map((sc, i) => (
                  <Segment key={sc.id} progress={scrollYProgress} i={i} n={n} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressLine({ progress }: { progress: MotionValue<number> }) {
  return <motion.span className="absolute inset-0 origin-left bg-kodak" style={{ scaleX: progress }} />;
}

/** One of the progress segments under the phone; fills during its screen. */
function Segment({ progress, i, n }: { progress: MotionValue<number>; i: number; n: number }) {
  const fill = useTransform(progress, (p) => Math.min(1, Math.max(0, p * n - i)));
  return (
    <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-halide/20">
      <motion.span className="absolute inset-0 origin-left rounded-full bg-kodak" style={{ scaleX: fill }} />
    </span>
  );
}
