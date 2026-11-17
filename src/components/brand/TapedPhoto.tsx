"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type TapedPhotoProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  rotate?: number;
  caption?: string;
  tape?: "top" | "corners" | "none";
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * A sleek, cinematic print. Features a clean white matte border and
 * translucent "frosted scotch tape" elements, scaled down for smaller displays.
 */
export function TapedPhoto({
  src,
  alt,
  width,
  height,
  rotate = 0,
  caption,
  tape = "top",
  sizes,
  priority,
  className,
}: TapedPhotoProps) {
  const reduceMotion = useReducedMotion();

  // Realistic frosted clear tape effect - slightly thinner for smaller images
  const tapeStyle =
    "absolute h-5 bg-white/40 backdrop-blur-md border border-white/30 shadow-[0_1px_3px_rgba(0,0,0,0.1)] " +
    "pointer-events-none z-20 after:content-[''] after:absolute after:inset-0 " +
    "after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent";

  return (
    <motion.figure
      initial={false}
      whileHover={
        reduceMotion ? undefined : { scale: 1.08, y: -4, zIndex: 30, rotate: 0 }
      }
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{ rotate }}
      className={cn(
        "relative inline-block group select-none flex-shrink-0",
        className,
      )}
    >
      {/* Clean Gallery Matte Frame - Padding reduced for smaller scale */}
      <div
        className={cn(
          "relative p-1.5 pb-6 sm:p-2 sm:pb-8 bg-[#FAFAFA]",
          "border border-zinc-200 shadow-[0_4px_15px_rgb(0,0,0,0.1)]",
          "transition-shadow duration-300 group-hover:shadow-[0_12px_30px_rgb(0,0,0,0.2)]",
        )}
      >
        <div className="relative overflow-hidden bg-black/5 border border-black/10">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            priority={priority}
            // Reduced heights: Mobile: 120px, Tablet: 160px, Desktop: 180px
            className="block h-[120px] sm:h-[160px] md:h-[180px] w-auto object-cover grayscale-[0.2] contrast-[1.1]"
          />
        </div>

        {/* Frosted Tape Variations - Scaled down widths */}
        {tape === "top" && (
          <div
            aria-hidden
            className={cn(
              tapeStyle,
              "w-14 -top-2.5 left-1/2 -translate-x-1/2 -rotate-2",
            )}
          />
        )}

        {tape === "corners" && (
          <>
            <div
              aria-hidden
              className={cn(tapeStyle, "w-10 -left-3 -top-2.5 -rotate-45")}
            />
            <div
              aria-hidden
              className={cn(tapeStyle, "w-10 -right-3 -top-2.5 rotate-45")}
            />
          </>
        )}
      </div>

      {/* Minimalist Gallery Caption */}
      {caption && (
        <figcaption className="mt-2 text-center font-mono text-[11px] sm:text-[10px] tracking-widest text-zinc-400 uppercase">
          {caption}
        </figcaption>
      )}
    </motion.figure>
  );
}
