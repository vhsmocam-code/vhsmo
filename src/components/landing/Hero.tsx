"use client";

import Image, { getImageProps } from "next/image";
import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { MagneticButton } from "@/components/brand/MagneticButton";
import { hero, RESERVE_HREF, YEAR_MARK, TAGLINE } from "@/lib/landing";

/**
 * Full-bleed cinematic opener. The photograph is the set; the wordmark
 * is sprayed across it larger than the viewport, drifting against the
 * cursor like a print floating over the scene.
 */
/* One <picture> for the backdrop, so each device downloads only its own
   photo (two <Image>s hidden by CSS would make phones fetch both). */
const heroCommon = { alt: hero.image.alt, fill: true, sizes: "100vw", quality: 75 } as const;
const {
  props: { srcSet: heroDesktopSet },
} = getImageProps({ ...heroCommon, src: hero.image.src });
const {
  props: { srcSet: heroMobileSet, ...heroImgProps },
} = getImageProps({ ...heroCommon, src: hero.imageMobile.src, fetchPriority: "high", loading: "eager" });

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 20 });
  const smy = useSpring(my, { stiffness: 60, damping: 20 });

  const imgX = useTransform(smx, [-0.5, 0.5], [14, -14]);
  const imgY = useTransform(smy, [-0.5, 0.5], [10, -10]);
  const logoX = useTransform(smx, [-0.5, 0.5], [-26, 26]);
  const logoY = useTransform(smy, [-0.5, 0.5], [-16, 16]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const scrollImgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const scrollLogoY = useTransform(scrollYProgress, [0, 1], ["0%", "-32%"]);
  const fade = useTransform(scrollYProgress, [0.5, 1], [1, 0]);

  function onMouseMove(e: React.MouseEvent) {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <section
      ref={ref}
      onMouseMove={onMouseMove}
      aria-label="VHSMO"
      className="relative flex h-[62svh] min-h-[480px] flex-col overflow-hidden bg-darkroom sm:h-[100svh] sm:min-h-[620px] sm:justify-end"
    >
      {/* The scene */}
      <motion.div
        className="absolute inset-[-4%]"
        style={reduceMotion ? undefined : { x: imgX, y: imgY }}
      >
        <motion.div
          className="relative h-full w-full"
          style={reduceMotion ? undefined : { y: scrollImgY }}
        >
          <picture>
            <source media="(min-width: 640px)" srcSet={heroDesktopSet} sizes="100vw" />
            <source srcSet={heroMobileSet} sizes="100vw" />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- alt comes from heroImgProps */}
            <img {...heroImgProps} className="object-cover object-[center_30%]" />
          </picture>
          {/* Brown wash + a light blur to soften the collage behind the type */}
          <div className="pointer-events-none absolute inset-0 bg-[#5A4332]/30 mix-blend-multiply sm:backdrop-blur-[2px]" />
          {/* <div className="absolute inset-0 bg-[#5A4332]/35 mix-blend-multiply" /> */}
          {/* <div className="absolute inset-0 bg-[#163B38]/45 mix-blend-multiply pointer-events-none" />{" "} */}
        </motion.div>
      </motion.div>
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-darkroom/85 via-darkroom/10 to-darkroom/65"
      />

      {/* The wordmark - full width, centered inside the frame (desktop) */}
      <motion.h1
        aria-label="VHSMO"
        className="pointer-events-none absolute left-1/2 top-1/2 hidden w-[90vw] max-w-[1400px] -translate-x-1/2 -translate-y-1/2 select-none text-center sm:block"
        style={reduceMotion ? undefined : { x: logoX, y: logoY }}
      >
        <motion.span
          className="block w-full select-none drop-shadow-[0.5rem_0.8rem_0_rgba(31,26,24,0.35)]"
          style={reduceMotion ? undefined : { y: scrollLogoY }}
        >
          <Image
            src="/yellowLogoTrim.png"
            alt="VHSMO"
            width={2258}
            height={589}
            priority
            sizes="(min-width: 1556px) 1400px, 90vw"
            className="block h-auto w-full"
          />
        </motion.span>
      </motion.h1>
    
      {/* Running heads */}

      {/* The pitch */}
      <motion.div
        style={reduceMotion ? undefined : { opacity: fade }}
        className="shell relative z-10 flex h-full flex-col items-center gap-4 pb-8 text-center sm:h-auto sm:flex-row sm:items-end sm:justify-between sm:pb-16 sm:text-left"
      >
        <div className="my-auto pt-24 sm:my-0 sm:pt-0">
          <p className="eyebrow text-kodak sm:hidden">{TAGLINE.join(" ")}</p>
          {/* The wordmark, in the stack Flashback-style (mobile) */}
          <h1
            aria-label="VHSMO"
            className="pointer-events-none mt-2 select-none text-center sm:hidden"
          >
            <span className="block w-full drop-shadow-[0.3rem_0.45rem_0_rgba(31,26,24,0.35)]">
              <Image
                src="/yellowLogoTrim.png"
                alt="VHSMO"
                width={2258}
                height={589}
                priority
                sizes="(min-width: 1556px) 1400px, 90vw"
                className="block h-auto w-full"
              />
            </span>
          </h1>
          <p className="mt-4 max-w-md text-lg font-medium leading-snug text-overexpose sm:mt-0 sm:text-2xl">
            {hero.sub}
          </p>
          <p className="eyebrow mt-3 hidden text-kodak sm:block">
            {TAGLINE.join(" ")}
          </p>
        </div>
        <MagneticButton href={RESERVE_HREF}>
          {hero.cta}
          <span aria-hidden>→</span>
        </MagneticButton>
      </motion.div>
    </section>
  );
}
