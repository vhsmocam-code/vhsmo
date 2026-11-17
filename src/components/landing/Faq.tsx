"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/brand/Reveal";
import { faq } from "@/lib/landing";

/**
 * The fine print, set as a ruled editorial index - hairlines, index
 * numbers, one accent. No boxes.
 */
export function LandingFaq() {
  return (
    <section id="faq" aria-label="Frequently asked questions" className="section paper">
      <div className="shell grid grid-cols-12 gap-y-12">
        <Reveal className="col-span-12 lg:col-span-4">
          {/* <p className="eyebrow text-darkroom/60">{faq.kicker}</p> */}
          <h2 className="display mt-6 text-[clamp(2.2rem,4vw,4.5rem)] text-darkroom">
            Asked,
            <br />
            answered.
          </h2>
          <p className="font-marker mt-8 rotate-[-2deg] text-lg text-darkroom/70">
            still curious? DM us on
            <a
              href="https://instagram.com/vhsmo.cam_"
              target="_blank"
              rel="noreferrer"
              className="bg-kodak py-1 px-1 mt-1 block w-fit text-darkroom transition-colors hover:text-bluehour"
            >
              @vhsmo.cam_
            </a>
            <span className="mt-2 block">or write to us at</span>
            <a
              href="mailto:team@vhsmo.com"
              className="bg-kodak py-1 px-1 mt-1 block w-fit text-darkroom  transition-colors hover:text-bluehour"
            >
              team@vhsmo.com
            </a>
          </p>
        </Reveal>

        <div className="col-span-12 lg:col-span-7 lg:col-start-6">
          <Accordion.Root type="single" collapsible className="border-t border-darkroom/25">
            {faq.items.map((item, i) => (
              <Accordion.Item
                key={item.q}
                value={`item-${i}`}
                className="border-b border-darkroom/25"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-baseline gap-4 py-6 sm:gap-6 text-left text-darkroom transition-colors hover:text-bluehour">
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
                  <p className="max-w-prose whitespace-pre-line pb-8 pl-9 pr-1 text-base sm:pl-14 sm:pr-8 leading-relaxed text-darkroom/80">
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
