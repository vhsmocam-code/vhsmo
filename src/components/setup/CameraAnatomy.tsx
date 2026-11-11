"use client";

import Image from "next/image";
import { useState } from "react";
import { Reveal } from "@/components/brand/Reveal";
import { anatomyPins } from "@/lib/setup";
import { seededRotation } from "@/lib/random";
import { cn } from "@/lib/utils";

/**
 * "Know your camera" - the real back-of-camera shot with numbered pins,
 * and a plain ruled index beside it. Pin and row highlight each other.
 */
export function CameraAnatomy() {
  const [active, setActive] = useState("wifi");

  return (
    <section aria-labelledby="anatomy-title" className="section paper">
      <div className="shell grid grid-cols-12 items-center gap-y-12 lg:gap-x-16">
        <Reveal className="col-span-12 lg:col-span-5">
          <h2
            id="anatomy-title"
            className="display text-[clamp(2.2rem,4.5vw,4rem)] text-darkroom"
          >
            Charge it.
            <br />
            Switch it on.
          </h2>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-darkroom/70">
            Give your VHSMO a charge before the first roll, then slide the
            switch to ON. Everything you need is on the back.
          </p>

          <ol className="mt-10 border-t border-darkroom/20">
            {anatomyPins.map((pin) => {
              const on = pin.id === active;
              return (
                <li key={pin.id} className="border-b border-darkroom/20">
                  <button
                    type="button"
                    onClick={() => setActive(pin.id)}
                    onMouseEnter={() => setActive(pin.id)}
                    aria-pressed={on}
                    className="flex w-full items-baseline gap-5 py-5 text-left"
                  >
                    <span
                      className={cn(
                        "eyebrow shrink-0 transition-opacity",
                        on ? "opacity-100" : "opacity-40",
                      )}
                    >
                      0{pin.label}
                    </span>
                    <span className="flex-1">
                      <span
                        className={cn(
                          "block text-lg font-semibold transition-colors sm:text-xl",
                          on ? "text-darkroom" : "text-darkroom/55",
                        )}
                      >
                        {pin.title}
                      </span>
                      <span
                        className={cn(
                          "grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                          on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <span className="overflow-hidden">
                          <span className="block pt-2 text-sm leading-relaxed text-darkroom/70 sm:text-base">
                            {pin.body}
                          </span>
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </Reveal>

        <Reveal
          delay={0.1}
          fromRotate={seededRotation(81, 2)}
          className="col-span-12 lg:col-span-7"
        >
          <figure
            className="relative bg-overexpose p-2.5 shadow-[0.5rem_0.9rem_1.6rem_rgba(31,26,24,0.22)] sm:p-3"
            style={{ rotate: `${seededRotation(82, 1.2)}deg` }}
          >
            <span
              aria-hidden
              className="tape -top-3 left-1/2 -translate-x-1/2"
              style={{ rotate: `${seededRotation(83, 5)}deg` }}
            />
            <div className="relative">
              <Image
                src="/buyproduct/blackBack.webp"
                alt="The back of a VHSMO camera: power switch on the left, Wi-Fi button on the right, shutter on top"
                width={1448}
                height={1086}
                sizes="(min-width: 1024px) 46rem, 92vw"
                className="h-auto w-full"
              />
              {anatomyPins.map((pin) => {
                const on = pin.id === active;
                return (
                  <button
                    key={pin.id}
                    type="button"
                    onClick={() => setActive(pin.id)}
                    onMouseEnter={() => setActive(pin.id)}
                    aria-label={pin.title}
                    aria-pressed={on}
                    className={cn(
                      "absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-bold transition-[background-color,color,transform] duration-300 sm:size-9 sm:text-sm",
                      on
                        ? "scale-110 bg-kodak text-darkroom shadow-[0_0_0_6px_rgba(253,241,0,0.25)]"
                        : "bg-darkroom text-overexpose ring-2 ring-overexpose hover:scale-105",
                    )}
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  >
                    {pin.label}
                  </button>
                );
              })}
            </div>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
