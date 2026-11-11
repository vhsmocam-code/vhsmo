"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/brand/Reveal";
import { troubleshooting } from "@/lib/setup";
import { StoreBadges } from "./StoreBadges";

/**
 * Troubleshooting, set like the landing FAQ - ruled index, numbers, one
 * accent - with the help note and store links alongside.
 */
export function SetupTroubleshooting() {
  return (
    <section
      id="help"
      aria-labelledby="help-title"
      className="section paper scroll-mt-20"
    >
      <div className="shell grid grid-cols-12 gap-y-12">
        <Reveal className="col-span-12 lg:col-span-4">
          <p className="eyebrow text-darkroom/55">Troubleshooting</p>
          <h2
            id="help-title"
            className="display mt-5 text-[clamp(2.2rem,4vw,4.5rem)] text-darkroom"
          >
            Not
            <br />
            working?
          </h2>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-darkroom/75">
            The fixes for everything the app might tell you, in plain English.
          </p>
          <p className="font-marker mt-8 rotate-[-2deg] text-lg text-darkroom/70">
            still stuck? DM us on
            <a
              href="https://instagram.com/vhsmo.cam_"
              target="_blank"
              rel="noreferrer"
              className="mt-1 block w-fit bg-kodak px-1 py-1 text-darkroom transition-colors hover:text-bluehour"
            >
              @vhsmo.cam_
            </a>
            <span className="mt-2 block">or write to us at</span>
            <a
              href="mailto:team@vhsmo.com"
              className="mt-1 block w-fit bg-kodak px-1 py-1 text-darkroom transition-colors hover:text-bluehour"
            >
              team@vhsmo.com
            </a>
          </p>
          <div className="mt-10">
            <p className="eyebrow mb-3 text-darkroom/55">Get the app</p>
            <StoreBadges tone="light" />
          </div>
        </Reveal>

        <div className="col-span-12 lg:col-span-7 lg:col-start-6">
          <Accordion.Root type="single" collapsible className="border-t border-darkroom/25">
            {troubleshooting.map((item, i) => (
              <Accordion.Item
                key={item.q}
                value={`item-${i}`}
                className="border-b border-darkroom/25"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-baseline gap-4 py-6 text-left text-darkroom transition-colors hover:text-bluehour sm:gap-6">
                    <span className="eyebrow shrink-0 opacity-50">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-lg font-semibold leading-snug sm:text-xl">
                      {item.q}
                    </span>
                    <Plus
                      aria-hidden
                      className="h-5 w-5 shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-45"
                    />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden data-[state=closed]:animate-[acc-up_0.25s_ease-out] data-[state=open]:animate-[acc-down_0.3s_ease-out]">
                  <p className="max-w-prose pb-8 pl-10 pr-4 text-base leading-relaxed text-darkroom/80 sm:pl-14 sm:pr-8">
                    {item.a}
                  </p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </div>
    </section>
  );
}
