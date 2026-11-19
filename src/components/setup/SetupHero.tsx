"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useState } from "react";
import { MagneticButton } from "@/components/brand/MagneticButton";
import { Reveal } from "@/components/brand/Reveal";
import { Scribble } from "@/components/brand/Scribble";
import { setupVideo } from "@/lib/setup";

/**
 * Setup hero - headline, one supporting line, two CTAs and the walkthrough video.
 */
export function SetupHero() {
  const [playing, setPlaying] = useState(false);

  return (
    <section
      aria-labelledby="setup-title"
      className="relative overflow-hidden bg-darkroom pt-28 sm:pt-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-10 h-[34rem] w-[34rem] rounded-full bg-kodak/10 blur-3xl"
      />

      <div className="shell relative grid grid-cols-12 items-center gap-y-12 pb-20 sm:pb-28 lg:gap-x-10">
        <div className="col-span-12 lg:col-span-6">
          <Reveal>
            <p className="eyebrow text-kodak">Camera setup</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1
              id="setup-title"
              className="display mt-6 text-[clamp(2.6rem,5.6vw,5rem)] text-halide"
            >
              Your VHSMO.
              <br />
              <span className="relative inline-block text-kodak">
                Ready for
                <Scribble className="absolute -bottom-3 left-0 h-3 w-full" />
              </span>
              <br />
              every moment.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-md text-balance text-lg leading-relaxed text-halide/75">
              Getting started is simple. Follow these quick steps to set up
              your camera and start capturing moments.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              <MagneticButton href="#step-1">
                Let&apos;s get started
                <span aria-hidden>↓</span>
              </MagneticButton>
              <a
                href="#video"
                className="text-sm font-semibold text-halide underline decoration-kodak decoration-2 underline-offset-[6px] transition-colors hover:text-kodak"
              >
                Watch the walkthrough
              </a>
            </div>
          </Reveal>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <div
            id="video"
            className="group relative mx-auto block aspect-video w-full max-w-[36rem] overflow-hidden rounded-[1.25rem] bg-darkroom-deep ring-1 ring-halide/15"
          >
            {playing ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${setupVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={setupVideo.alt}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 h-full w-full border-0"
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label="Play setup walkthrough video"
                className="absolute inset-0 h-full w-full text-left focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-kodak"
              >
                <Image
                  src={setupVideo.thumbnail}
                  alt={setupVideo.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 36rem, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span className="absolute inset-0 bg-darkroom/25 transition-colors group-hover:bg-darkroom/15" />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid size-16 place-items-center rounded-full bg-kodak text-darkroom shadow-[0_1rem_2.5rem_-0.5rem_rgba(0,0,0,0.55)] transition-transform duration-300 group-hover:scale-110 sm:size-20">
                    <Play className="ml-1 size-7 fill-current sm:size-8" aria-hidden />
                  </span>
                </span>
                <span className="absolute bottom-4 left-4 rounded-full bg-darkroom/85 px-3 py-1.5 text-xs font-semibold text-halide backdrop-blur-sm">
                  Watch the setup walkthrough
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
