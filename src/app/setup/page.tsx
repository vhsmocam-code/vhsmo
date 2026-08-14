import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BatteryCharging,
  Power,
  Smartphone,
  Wifi,
  Camera,
  Apple,
  Play,
} from "lucide-react";
import { Reveal } from "@/components/brand/Reveal";
import { Sticker } from "@/components/brand/Sticker";
import { MagneticButton } from "@/components/brand/MagneticButton";
import { Scribble } from "@/components/brand/Scribble";
import { seededRotation } from "@/lib/random";
import { TAGLINE } from "@/lib/landing";

export const metadata: Metadata = {
  title: "Set up your VHSMO",
  description:
    "Get your VHSMO Camera and the VHSMO App talking in five quick steps - charge, power on, download, pair over WiFi, and shoot straight to your phone.",
  alternates: { canonical: "/setup" },
};

type Step = {
  n: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  note: string;
  seed: number;
};

const steps: Step[] = [
  {
    n: "01",
    icon: BatteryCharging,
    title: "Charge it up",
    body: "Plug the USB-C cable into the port on the side and give it a full charge before your first roll. The status light glows amber while charging and turns green when it's ready to go.",
    note: "~2 hrs to full",
    seed: 3,
  },
  {
    n: "02",
    icon: Power,
    title: "Power on",
    body: "Hold the shutter-side power button for two seconds until the lens wakes. The first boot sets the clock and gets the camera ready to pair - you'll only do this once.",
    note: "hold to wake",
    seed: 7,
  },
  {
    n: "03",
    icon: Smartphone,
    title: "Download the app",
    body: "Grab the VHSMO App from the App Store or Google Play. It's where your shots land, get their film looks, and go out to everyone. Coming soon to iOS and Android.",
    note: "iOS + Android",
    seed: 11,
  },
  {
    n: "04",
    icon: Wifi,
    title: "Pair over WiFi",
    body: "Open the app, tap Pair a camera, and hold your phone close. The camera makes its own WiFi hotspot - accept the prompt and the two shake hands automatically. No cables, no card readers.",
    note: "no cables",
    seed: 15,
  },
  {
    n: "05",
    icon: Camera,
    title: "Point. Shoot. Share.",
    body: "That's it - you're set. Every frame you shoot lands in your camera roll in seconds, while the night keeps going. Add a film filter and send it on.",
    note: "it's already there",
    seed: 19,
  },
];

/**
 * The setup spread - the same magazine-scan language as the landing page,
 * turned into a five-step onboarding for pairing the camera with the app.
 * Each step is a developed print taped down the page.
 */
export default function SetupPage() {
  return (
    <div className="relative overflow-hidden bg-darkroom text-halide">
      <div className="container-px mx-auto max-w-3xl pt-28 pb-24 sm:pt-32">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-halide/70 transition-colors hover:text-halide"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>

        {/* ---------- Header ---------- */}
        <header className="mt-8 text-center">
          <Reveal>
            <Sticker rotate={seededRotation(2, 4)} size="md">
              First roll
            </Sticker>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="display mt-6 text-[clamp(2.2rem,6vw,4.2rem)] leading-[0.95] text-halide">
              Set up your
              <br />
              <span className="text-kodak">VHSMO</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-md text-balance text-base leading-relaxed text-halide/75 sm:text-lg">
              Get the camera and the app talking in five quick steps. Takes about
              five minutes - most of it is the charge.
            </p>
            <p className="eyebrow mt-4 text-kodak">{TAGLINE.join(" ")}</p>
          </Reveal>
        </header>

        {/* ---------- Steps ---------- */}
        <ol className="mt-16 flex flex-col gap-10 sm:gap-14">
          {steps.map((step, i) => (
            <li key={step.n}>
              <Reveal delay={0.05} fromRotate={seededRotation(step.seed, 2)}>
                <StepCard step={step} flip={i % 2 === 1} />
              </Reveal>
            </li>
          ))}
        </ol>

        {/* ---------- Get the app ---------- */}
        <Reveal className="mt-20">
          <div className="relative border-2 border-halide/15 bg-darkroom-deep/60 p-8 text-center backdrop-blur-sm sm:p-12">
            <Sticker variant="bluehour" rotate={seededRotation(23, 3)}>
              Get the app
            </Sticker>
            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-halide/75 sm:text-base">
              The VHSMO App is where the magic lands. Coming soon to iOS and
              Android - the store buttons go live at launch.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <StoreBadge
                icon={Apple}
                top="Coming soon on the"
                bottom="App Store"
              />
              <StoreBadge
                icon={Play}
                top="Coming soon on"
                bottom="Google Play"
              />
            </div>
          </div>
        </Reveal>

        {/* ---------- Troubleshooting ---------- */}
        <Reveal className="mt-16">
          <h2 className="font-marker text-2xl text-kodak sm:text-3xl">
            Not pairing?
          </h2>
          <ul className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-halide/80 sm:text-base">
            <TroubleItem>
              Make sure the camera is powered on and within a few feet of your
              phone.
            </TroubleItem>
            <TroubleItem>
              Turn WiFi on in your phone settings, then accept the camera&apos;s
              network when the app asks.
            </TroubleItem>
            <TroubleItem>
              Still stuck? Power the camera off and on, then tap{" "}
              <span className="font-semibold text-halide">Pair a camera</span>{" "}
              again.
            </TroubleItem>
          </ul>
        </Reveal>

        {/* ---------- Help + CTA ---------- */}
        <Reveal className="mt-16 text-center">
          <span className="relative inline-block">
            <span className="font-marker text-sm text-halide/60">
              need a hand? we&apos;ve got you.
            </span>
            <Scribble className="absolute -bottom-1.5 left-0 h-2 w-full opacity-70" />
          </span>
          <p className="mt-6 text-sm text-halide/70">
            Reach us any time at{" "}
            <a
              href="mailto:vhsmo.cam@gmail.com"
              className="font-semibold text-kodak underline-offset-4 hover:underline"
            >
              vhsmo.cam@gmail.com
            </a>
          </p>
          <div className="mt-10 flex justify-center">
            <MagneticButton href="/#reserve">
              Reserve yours
              <span aria-hidden>→</span>
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ---------------- pieces ---------------- */

/**
 * One setup step as a taped-in print: numbered exposure with the step
 * burned in on the left, the instruction written out on the right.
 */
function StepCard({ step, flip }: { step: Step; flip: boolean }) {
  const Icon = step.icon;
  return (
    <div
      className={
        "flex flex-col items-center gap-6 sm:items-stretch sm:gap-8 " +
        (flip ? "sm:flex-row-reverse" : "sm:flex-row")
      }
    >
      {/* The numbered print */}
      <div
        className="relative w-40 shrink-0 self-center bg-overexpose p-2 pb-1 shadow-[0.3rem_0.5rem_1rem_rgba(31,26,24,0.5)]"
        style={{ rotate: `${seededRotation(step.seed, 3)}deg` }}
      >
        <span
          aria-hidden
          className="tape -top-2.5 left-1/2 h-5 w-16 -translate-x-1/2"
          style={{ rotate: `${seededRotation(step.seed + 5, 6)}deg` }}
        />
        <div className="flex flex-col items-center justify-center gap-2 bg-darkroom-deep py-6">
          <Icon className="size-8 text-kodak" />
          <span className="font-marker text-4xl leading-none tabular-nums text-kodak">
            {step.n}
          </span>
        </div>
      </div>

      {/* The instruction */}
      <div className="flex-1 text-center sm:pt-2 sm:text-left">
        <h3 className="display text-[clamp(1.5rem,3.2vw,2.2rem)] leading-tight text-halide">
          {step.title}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-halide/75 sm:mx-0 sm:text-base">
          {step.body}
        </p>
        <span className="font-marker mt-4 inline-block -rotate-1 bg-kodak px-2 py-0.5 text-sm text-darkroom">
          {step.note}
        </span>
      </div>
    </div>
  );
}

function StoreBadge({
  icon: Icon,
  top,
  bottom,
}: {
  icon: React.ComponentType<{ className?: string }>;
  top: string;
  bottom: string;
}) {
  return (
    <div className="flex w-full items-center gap-3 border-2 border-halide/25 bg-darkroom px-5 py-3 opacity-70 sm:w-auto">
      <Icon className="size-7 shrink-0 text-halide" />
      <div className="text-left leading-tight">
        <span className="block text-[0.6rem] uppercase tracking-wide text-halide/60">
          {top}
        </span>
        <span className="block text-lg font-semibold text-halide">{bottom}</span>
      </div>
    </div>
  );
}

function TroubleItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden
        className="mt-2 size-1.5 shrink-0 rounded-full bg-kodak"
      />
      <span>{children}</span>
    </li>
  );
}
