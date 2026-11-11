import Image from "next/image";
import { Reveal } from "@/components/brand/Reveal";
import { Sticker } from "@/components/brand/Sticker";
import { Scribble } from "@/components/brand/Scribble";
import { seededRotation } from "@/lib/random";
import { cameraColours } from "@/lib/setup";
import { StoreBadges } from "./StoreBadges";

const placements = [
  "left-[2%] top-[4%] w-[62%] z-10",
  "right-[0%] top-[24%] w-[64%] z-20",
  "left-[8%] top-[52%] w-[58%] z-30",
];

/**
 * Setup hero - headline, one line, the store buttons, and the three
 * VHSMO colours floating on the right. Nothing else.
 */
export function SetupHero() {
  return (
    <section
      aria-labelledby="setup-title"
      className="relative overflow-hidden bg-darkroom pt-28 sm:pt-36"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-10 h-[34rem] w-[34rem] rounded-full bg-kodak/10 blur-3xl"
      />

      <div className="shell relative grid grid-cols-12 items-center gap-y-14 pb-20 sm:pb-28 lg:gap-x-10">
        <div className="col-span-12 lg:col-span-6">
          <Reveal>
            <Sticker rotate={seededRotation(2, 4)} size="md">
              First roll ✶
            </Sticker>
          </Reveal>

          <Reveal delay={0.05}>
            <h1
              id="setup-title"
              className="display mt-7 text-[clamp(2.8rem,8vw,6.2rem)] text-halide"
            >
              Set up your
              <br />
              <span className="relative inline-block text-kodak">
                VHSMO
                <Scribble className="absolute -bottom-3 left-0 h-3 w-full" />
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-8 max-w-md text-balance text-lg leading-relaxed text-halide/75">
              Camera and phone talking in about five minutes. No cables, no
              card readers.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <StoreBadges className="mt-10" />
            <a
              href="#steps"
              className="mt-8 inline-block text-sm font-semibold text-kodak underline-offset-4 hover:underline"
            >
              Show me how ↓
            </a>
          </Reveal>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <Reveal
            delay={0.1}
            className="relative mx-auto aspect-[1/0.95] w-full max-w-[34rem]"
          >
            {cameraColours.map((cam, i) => (
              <div
                key={cam.name}
                className={`absolute ${placements[i]}`}
                style={{ rotate: `${seededRotation(40 + i * 7, 7)}deg` }}
              >
                <div
                  className="cam-float"
                  style={{ animationDelay: `${i * -2.3}s` }}
                >
                  <Image
                    src={cam.src}
                    alt={`VHSMO camera in ${cam.name}`}
                    width={900}
                    height={600}
                    priority={i === 0}
                    sizes="(min-width: 1024px) 22rem, 60vw"
                    className="h-auto w-full drop-shadow-[0_1.6rem_1.8rem_rgba(0,0,0,0.55)]"
                  />
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
