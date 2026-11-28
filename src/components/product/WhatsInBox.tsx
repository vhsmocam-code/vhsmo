"use client";

import Image from "next/image";
import Link from "next/link";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { boxContents, DEFAULT_PRODUCT_IMAGE } from "@/lib/products";
import { useColor } from "@/lib/color-context";
import { Reveal } from "@/components/brand/Reveal";
import { boxIcons } from "@/components/product/ProductAccordion";
import { DELIVERY_ETA, DISPATCH_ETA } from "@/lib/shipping";

const promises: { icon: LucideIcon; title: string; sub: string; href?: string }[] = [
  {
    icon: Truck,
    title: "Free shipping across India",
    sub: `Ships within ${DISPATCH_ETA}, arrives in ${DELIVERY_ETA}.`,
    href: "/legal/shipping",
  },
  {
    icon: ShieldCheck,
    title: "12-month warranty",
    sub: "Manufacturing defects and hardware faults, covered.",
  },
  {
    icon: RotateCcw,
    title: "Refund policy",
    sub: "Read how refunds and replacements work.",
    href: "/legal/refund",
  },
];

/** What ships in the box, plus the shipping and warranty promises. */
export function WhatsInBox() {
  const { variant } = useColor();
  // The camera tile shows the finish on the stage, so it matches the pick.
  const camera = variant?.images[0] ?? DEFAULT_PRODUCT_IMAGE;

  return (
    <section id="whats-in-box" aria-label="What's in the box" className="section scroll-mt-20 bg-overexpose">
      <div className="shell">
        <Reveal>
          <p className="eyebrow text-darkroom/55">In the box</p>
          <h2 className="display mt-4 text-[clamp(2rem,4vw,3.5rem)] text-darkroom">
            Everything you need,
            <br className="hidden sm:block" /> nothing you don&apos;t.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ul className="grid grid-cols-2 gap-4">
            {boxContents.map((entry, i) => {
              const Icon = boxIcons[entry.icon];
              return (
                <Reveal key={entry.item} delay={i * 0.05}>
                  <li className="flex h-full flex-col items-center gap-3 bg-halide/50 p-4 text-center sm:p-5">
                    <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-overexpose">
                      {entry.icon === "camera" ? (
                        <Image
                          src={camera.src}
                          alt={camera.alt}
                          fill
                          sizes="(max-width: 1024px) 45vw, 280px"
                          className="object-contain"
                        />
                      ) : (
                        <span className="flex size-16 items-center justify-center rounded-full bg-kodak">
                          <Icon className="size-7 text-darkroom" strokeWidth={1.6} />
                        </span>
                      )}
                    </div>
                    <span>
                      <span className="block text-sm font-bold text-darkroom sm:text-base">
                        {entry.item}
                      </span>
                      <span className="mt-0.5 block text-xs text-darkroom/60 sm:text-sm">
                        {entry.detail}
                      </span>
                    </span>
                  </li>
                </Reveal>
              );
            })}
          </ul>

          <Reveal>
            <ul className="border-y border-darkroom/15">
              {promises.map((p) => {
                const body = (
                  <>
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-kodak text-darkroom">
                      <p.icon className="size-5" strokeWidth={1.7} />
                    </span>
                    <span>
                      <span className="block font-bold text-darkroom">{p.title}</span>
                      <span className="block text-sm text-darkroom/65">{p.sub}</span>
                    </span>
                  </>
                );
                return (
                  <li key={p.title} className="border-t border-darkroom/10 first:border-t-0">
                    {p.href ? (
                      <Link
                        href={p.href}
                        className="flex items-center gap-4 py-6 transition-colors hover:text-bluehour"
                      >
                        {body}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-4 py-6">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="font-marker mt-6 rotate-[-1.5deg] text-xl text-darkroom">
              Charge it. Turn it on. Start shooting.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
