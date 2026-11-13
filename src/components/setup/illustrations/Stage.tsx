"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import styles from "./illustrations.module.css";

/**
 * Wraps one illustration: the soft darkroom panel, and play/pause so loops
 * only run while on screen. `paused` lets a parent (the walkthrough) hold
 * it still.
 */
export function IllustrationStage({
  label,
  paused,
  className,
  children,
}: {
  label: string;
  paused?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      role="img"
      aria-label={label}
      data-playing={inView && !paused ? "true" : "false"}
      className={cn(styles.stage, className)}
    >
      {children}
    </div>
  );
}
