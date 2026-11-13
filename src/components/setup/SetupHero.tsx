import { MagneticButton } from "@/components/brand/MagneticButton";
import { Reveal } from "@/components/brand/Reveal";
import { Scribble } from "@/components/brand/Scribble";
import { heroMedia } from "@/lib/setup";
import { MediaSlot } from "./MediaSlot";

/**
 * Setup hero - headline, one supporting line, two CTAs and the camera.
 */
export function SetupHero() {
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
          <div className="cam-float mx-auto w-full max-w-[36rem]">
            <MediaSlot
              config={heroMedia}
              bare
              priority
              sizes="(min-width: 1024px) 36rem, 100vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
