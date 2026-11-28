"use client";

import { Usb } from "lucide-react";
import { Reveal } from "@/components/brand/Reveal";
import { AppConnect, ReadyToShoot, WifiOn } from "@/components/setup/illustrations";
import { howItWorks } from "@/lib/products";

const scenes = {
  "ready-to-shoot": ReadyToShoot,
  "wifi-on": WifiOn,
  "app-connect": AppConnect,
} as const;

/** Three steps from shutter to phone, drawn with the setup-guide scenes. */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-label="How it works"
      className="section scroll-mt-20 bg-darkroom text-halide"
    >
      <div className="shell">
        <Reveal>
          <p className="eyebrow text-halide/55">How it works</p>
          <h2 className="display mt-4 text-[clamp(2rem,4vw,3.5rem)] text-overexpose">
            Shutter to phone
            <br className="hidden sm:block" /> in three steps.
          </h2>
        </Reveal>

        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {howItWorks.map((step, i) => {
            const Scene = scenes[step.illustration];
            return (
              <Reveal key={step.step} delay={i * 0.08}>
                <li>
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl md:aspect-square">
                    <Scene label={step.title} />
                  </div>
                  <p className="eyebrow mt-6 text-kodak">{step.step}</p>
                  <h3 className="mt-2 text-xl font-bold text-overexpose sm:text-2xl">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-halide/75">
                    {step.detail}
                  </p>
                </li>
              </Reveal>
            );
          })}
        </ol>

        <Reveal>
          <p className="mt-12 flex items-start gap-3 rounded-2xl bg-overexpose/[0.06] p-5 text-sm leading-relaxed text-halide/80">
            <Usb className="mt-0.5 size-5 shrink-0 text-kodak" strokeWidth={1.8} />
            <span>
              <span className="font-semibold text-overexpose">Prefer a cable?</span>{" "}
              Plug the camera into your computer over USB-C to browse and copy
              your photos - no app needed.
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
