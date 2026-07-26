"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { Cable, Camera, Gift, MemoryStick, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Item = {
  title: string;
  body: React.ReactNode;
};

/** A single "what's inside" line - kodak disc icon, then the item. */
function BoxItem({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-kodak/90">
        <Icon className="size-4 text-darkroom" strokeWidth={2} />
      </span>
      <span className="text-darkroom/85">{children}</span>
    </li>
  );
}

const items: Item[] = [
  {
    title: "How It Works",
    body: (
      <div className="space-y-4">
        <p className="font-semibold text-darkroom">
          Using VHSMO is as simple as using a disposable camera.
        </p>
        <p>
          Frame your shot through the viewfinder and press the shutter.
          That&apos;s it - no confusing menus, modes, or settings to worry
          about.
        </p>
        <p>
          When you&apos;re ready to view or share your photos, simply press the
          Wi-Fi button on the back and open the VHSMO app. Your photos transfer
          directly to your phone in seconds, with no internet required.
        </p>
        <p>
          Prefer a cable? Plug the camera into your computer using USB-C to
          browse and copy your photos instantly - no app needed.
        </p>
        <p>
          And because there&apos;s no screen pulling you back in, you stay where
          the memory is happening. No reviewing every shot. No chasing perfect.
          Just capture it and keep living it.
        </p>
      </div>
    ),
  },
  {
    title: "Reservation & Shipping Policy",
    body: (
      <div className="space-y-4">
        <p className="font-semibold text-darkroom">
          Lock in the first-batch price.
        </p>
        <p>
          Reserve your VHSMO at the exclusive pre-order price while first-batch
          stock lasts. VHSMO is currently in production, and all reserved units
          are scheduled to ship by 15 September 2026.
        </p>
        <p>
          Since each VHSMO is reserved as part of the first production batch,
          we’re unable to offer cancellations or refunds once an order is
          placed. However, if your order hasn’t shipped by 15 September 2026,
          you’ll still be eligible for a full refund.
        </p>
        <p className="font-semibold text-darkroom">
          Free standard shipping across India.
        </p>
        <p>
          We&apos;ll send you a production update before dispatch, followed by
          tracking details once your VHSMO is on the way.
        </p>
      </div>
    ),
  },
  {
    title: "What's Inside",
    body: (
      <div className="space-y-4">
        <p>
          Every VHSMO comes ready to start shooting straight out of the box.
        </p>
        <div>
          <p className="font-semibold text-darkroom">
            Included with every camera:
          </p>
          <ul className="mt-2.5 space-y-2">
            <BoxItem icon={Camera}>VHSMO Camera</BoxItem>
            <BoxItem icon={Cable}>USB-C charging and data cable</BoxItem>
            <BoxItem icon={MemoryStick}>
              4GB microSD card, pre-installed
            </BoxItem>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-darkroom">
            Limited-time pre-order bonus:
          </p>
          <ul className="mt-2.5 space-y-2">
            <BoxItem icon={Gift}>VHSMO lanyard</BoxItem>
            <BoxItem icon={Gift}>Exclusive VHSMO sticker pack</BoxItem>
          </ul>
        </div>
        <p className="font-marker text-darkroom">
          Charge it. Turn it on. Start shooting.
        </p>
      </div>
    ),
  },
  {
    title: "Specs",
    body: (
      <div className="space-y-4">
        <p>
          Everything you need to capture the moment - without menus, settings or
          distractions.
        </p>
        <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {[
            ["Sensor", "5MP CMOS sensor"],
            ["Lens", "Fixed-focus retro lens with a 71° field of view"],
            ["Shooting", "Automatic exposure and white balance"],
            ["Transfer", "Direct wireless transfer through the VHSMO app"],
            ["USB-C", "Rechargeable battery and wired photo transfer"],
            ["Viewfinder", "Classic 35MM optical viewfinder"],
            ["Flash", "Built-in 2W LED flash"],
            ["Storage", "4GB microSD card included"],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col">
              <dt className="text-xs font-semibold uppercase tracking-wide text-darkroom/50">
                {label}
              </dt>
              <dd className="text-darkroom/85">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="font-marker text-darkroom">
          No screen. No filters. Just point, shoot and keep living.
        </p>
      </div>
    ),
  },
  {
    title: "Warranty & Replacements",
    body: (
      <div className="space-y-4">
        <p className="font-semibold text-darkroom">
          Something we caused? We&apos;ll make it right.
        </p>
        <p>
          Every VHSMO includes a 12-month limited warranty covering
          manufacturing defects and hardware malfunctions under normal use.
        </p>
        <p>
          <span className="font-semibold text-darkroom">Covered:</span>{" "}
          Dead-on-arrival units, defects in materials or workmanship, and
          factory-related hardware issues.
        </p>
        <p>
          <span className="font-semibold text-darkroom">Not covered:</span>{" "}
          Drops, water damage, misuse, unauthorized repairs, modifications, or
          normal wear and tear.
        </p>
        <p>
          To make a claim, email{" "}
          <a
            href="mailto:team@vhsmo.com"
            className="font-semibold text-bluehour underline underline-offset-2"
          >
            team@vhsmo.com
          </a>{" "}
          with your order number and clear photos or videos of the issue. Once
          verified, we&apos;ll arrange a repair or replacement.
        </p>
      </div>
    ),
  },
];

/** The fine print, ruled like the FAQ - same hairlines, blue hover,
 *  same open/close motion. */
export function ProductAccordion() {
  return (
    <Accordion.Root type="single" collapsible className="border-t border-darkroom/25">
      {items.map((item) => (
        <Accordion.Item
          key={item.title}
          value={item.title}
          className="border-b border-darkroom/25"
        >
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-6 py-6 text-left text-darkroom transition-colors hover:text-bluehour">
              <span className="text-xl font-bold sm:text-2xl">{item.title}</span>
              <Plus
                aria-hidden
                strokeWidth={1.8}
                className="h-7 w-7 shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-45"
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=closed]:animate-[acc-up_0.25s_ease-out] data-[state=open]:animate-[acc-down_0.3s_ease-out]">
            <div className="pb-7 pr-10 text-[0.95rem] leading-relaxed text-darkroom/80">
              {item.body}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
