"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  AppConnect,
  Charging,
  NotificationLight,
  PowerOn,
  ReadyToShoot,
  WifiOn,
} from "./illustrations";
import styles from "./illustrations/illustrations.module.css";

const scenes = [
  { id: "power", label: "Switch it on", seconds: 6, C: PowerOn },
  { id: "led", label: "Look for the light", seconds: 5, C: NotificationLight },
  { id: "shoot", label: "Start shooting", seconds: 5, C: ReadyToShoot },
  { id: "wifi", label: "Press the Wi-Fi button", seconds: 6, C: WifiOn },
  { id: "app", label: "Connect in the app", seconds: 5, C: AppConnect },
  { id: "charge", label: "Charge it up", seconds: 7, C: Charging },
] as const;

/**
 * The whole setup as one animated sequence, standing in for a video.
 * Plays only while on screen; never auto-plays for reduced-motion visitors,
 * who step through with the segments instead.
 */
export function WalkthroughAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlaying(false);
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const running = playing && inView;
  const scene = scenes[index]!;
  const Scene = scene.C;
  const next = () => setIndex((i) => (i + 1) % scenes.length);

  return (
    <div ref={ref} className="mx-auto w-full max-w-5xl">
      <div className="relative aspect-video w-full overflow-hidden rounded-[1.25rem] bg-darkroom-deep ring-1 ring-halide/10">
        <AnimatePresence initial={false}>
          <motion.div
            key={scene.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Scene label={`Step ${index + 1}: ${scene.label}`} paused={!running} />
          </motion.div>
        </AnimatePresence>

        {/* Caption */}
        <div className="pointer-events-none absolute left-4 top-4 flex items-baseline gap-3 sm:left-7 sm:top-6">
          <span className="font-marker text-2xl tabular-nums text-kodak sm:text-4xl">
            {String(index + 1).padStart(2, "0")}
          </span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={scene.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="display text-lg text-halide sm:text-3xl"
            >
              {scene.label}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-5 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-pressed={playing}
          aria-label={playing ? "Pause walkthrough" : "Play walkthrough"}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-kodak text-darkroom transition-transform duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kodak"
        >
          {playing ? (
            <Pause className="size-4 fill-current" aria-hidden />
          ) : (
            <Play className="ml-0.5 size-4 fill-current" aria-hidden />
          )}
        </button>
        <ol className="grid flex-1 grid-cols-6 gap-1.5 sm:gap-2">
          {scenes.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Step ${i + 1}: ${s.label}`}
                aria-current={i === index ? "step" : undefined}
                className="group block w-full py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kodak"
              >
                <span className="block h-1 overflow-hidden rounded-full bg-halide/15">
                  {i < index && <span className="block h-full bg-halide/60" />}
                  {i === index && (
                    <span
                      key={`${s.id}-${index}`}
                      className={cn(styles.segFill, "bg-kodak")}
                      style={{
                        animationDuration: `${s.seconds}s`,
                        animationPlayState: running ? "running" : "paused",
                      }}
                      onAnimationEnd={next}
                    />
                  )}
                </span>
                <span
                  className={cn(
                    "mt-2 hidden text-xs leading-tight transition-colors md:block",
                    i === index ? "text-halide" : "text-halide/45 group-hover:text-halide/80",
                  )}
                >
                  {s.label}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
