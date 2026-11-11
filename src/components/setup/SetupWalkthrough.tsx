"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/brand/Reveal";
import { walkthroughSteps } from "@/lib/setup";
import { cn } from "@/lib/utils";
import { JoinDetails } from "./JoinDetails";
import { PhoneFrame } from "./PhoneFrame";
import { StoreBadges } from "./StoreBadges";

/**
 * The in-app setup, step by step. On desktop the phone stays pinned on the
 * right and swaps to the real screen for whichever step is centred; on
 * phones each step carries its own screenshot.
 */
export function SetupWalkthrough() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const els = stepRefs.current.filter(Boolean) as HTMLElement[];
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const i = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(i)) setActive(i);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="steps"
      aria-labelledby="steps-title"
      className="relative scroll-mt-16 bg-darkroom pb-24 pt-24 sm:pb-32 sm:pt-32"
    >
      <div className="shell">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-kodak">In the app</p>
          <h2
            id="steps-title"
            className="display mt-5 text-[clamp(2.4rem,5.5vw,4.8rem)] text-halide"
          >
            Five taps
            <br />
            to your first roll.
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-12 lg:mt-8 lg:gap-x-12">
          {/* Steps */}
          <ol className="col-span-12 lg:col-span-6">
            {walkthroughSteps.map((step, i) => (
              <li
                key={step.id}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                data-index={i}
                className="flex flex-col justify-center py-14 first:pt-0 lg:min-h-[78vh] lg:py-0 lg:first:pt-0"
              >
                <Reveal>
                  <div
                    className={cn(
                      "transition-opacity duration-500 lg:opacity-30",
                      active === i && "lg:opacity-100",
                    )}
                  >
                    <span className="font-marker block text-6xl leading-none tabular-nums text-kodak sm:text-7xl">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="display mt-5 text-[clamp(2rem,4vw,3.4rem)] text-halide">
                      {step.title}
                    </h3>
                    <p className="mt-5 max-w-md text-lg leading-relaxed text-halide/75">
                      {step.body}
                    </p>
                    {step.aside && (
                      <p className="mt-4 max-w-md text-sm leading-relaxed text-halide/50">
                        {step.aside}
                      </p>
                    )}
                    {step.id === "app" && <StoreBadges className="mt-8" />}
                    {step.id === "join" && (
                      <div className="mt-8 max-w-md">
                        <JoinDetails />
                      </div>
                    )}
                  </div>

                  {/* Phone, inline (mobile + tablet) */}
                  <div className="mx-auto mt-12 w-[72%] max-w-[18rem] lg:hidden">
                    <PhoneFrame src={step.screen} alt={step.alt} />
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>

          {/* Pinned phone (desktop) */}
          <div className="hidden lg:col-span-5 lg:col-start-8 lg:block">
            <div className="sticky top-0 flex h-screen items-center justify-center pt-12">
              <div className="relative w-full max-w-[19rem]">
                <div
                  aria-hidden
                  className="absolute -inset-16 -z-10 rounded-full bg-kodak/10 blur-3xl"
                />
                <div className="relative grid">
                  {walkthroughSteps.map((step, i) => (
                    <PhoneFrame
                      key={step.id}
                      src={step.screen}
                      alt={active === i ? step.alt : ""}
                      priority={i === 0}
                      className={cn(
                        "[grid-area:1/1] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                        active === i
                          ? "translate-y-0 opacity-100"
                          : "pointer-events-none translate-y-3 opacity-0",
                      )}
                    />
                  ))}
                </div>
                <div className="mt-8 flex justify-center gap-2">
                  {walkthroughSteps.map((step, i) => (
                    <span
                      key={step.id}
                      aria-hidden
                      className={cn(
                        "h-1.5 rounded-full transition-[width,background-color] duration-500",
                        active === i ? "w-6 bg-kodak" : "w-1.5 bg-halide/25",
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
