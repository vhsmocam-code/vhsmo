"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Silent looping clip (the GIF replacement). Plays only while on screen and
 * stays on its poster frame, with controls, if the visitor prefers reduced
 * motion.
 */
export function LoopVideo({
  sources,
  poster,
  label,
  fit,
}: {
  sources: { src: string; type: string }[];
  poster?: string;
  label: string;
  fit: "cover" | "contain";
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const el = ref.current;
    if (!el || mq.matches || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      controls={reduced}
      aria-label={label}
      className={cn(
        "absolute inset-0 h-full w-full",
        fit === "cover" ? "object-cover" : "object-contain",
      )}
    >
      {sources.map((s) => (
        <source key={s.src} src={s.src} type={s.type} />
      ))}
    </video>
  );
}
