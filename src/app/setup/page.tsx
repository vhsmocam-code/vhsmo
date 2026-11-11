import type { Metadata } from "next";
import { Marquee } from "@/components/brand/Marquee";
import { MagneticButton } from "@/components/brand/MagneticButton";
import { Reveal } from "@/components/brand/Reveal";
import { Scribble } from "@/components/brand/Scribble";
import { CameraAnatomy } from "@/components/setup/CameraAnatomy";
import { SetupHero } from "@/components/setup/SetupHero";
import { SetupWalkthrough } from "@/components/setup/SetupWalkthrough";
import { SetupTroubleshooting } from "@/components/setup/SetupTroubleshooting";
import { RESERVE_HREF, TAGLINE } from "@/lib/landing";

const description =
  "Set up your VHSMO camera with the VHSMO App: charge, switch on, press the Wi-Fi button and connect in about five minutes. Step-by-step guide plus fixes for common pairing and offload issues.";

export const metadata: Metadata = {
  title: "Set up your VHSMO",
  description,
  alternates: { canonical: "/setup" },
  openGraph: {
    title: "Set up your VHSMO",
    description,
    url: "/setup",
  },
};

/**
 * The setup guide - hero, camera basics, the in-app flow shown with real
 * screenshots, and troubleshooting lifted from the app's own messages.
 */
export default function SetupPage() {
  return (
    <div className="relative overflow-x-clip bg-darkroom text-halide">
      <SetupHero />
      <Marquee text={TAGLINE.join(" ")} variant="kodak" duration={32} />
      <CameraAnatomy />
      <SetupWalkthrough />
      <SetupTroubleshooting />

      <section className="section-sm bg-darkroom">
        <Reveal className="shell text-center">
          <span className="relative inline-block">
            <span className="font-marker text-lg text-halide/70">
              don&apos;t have one yet?
            </span>
            <Scribble className="absolute -bottom-1.5 left-0 h-2 w-full opacity-70" />
          </span>
          <p className="display mx-auto mt-6 max-w-xl text-[clamp(2rem,4.5vw,3.6rem)] text-halide">
            Stay in the moment.
            <br />
            <span className="text-kodak">Relive it later.</span>
          </p>
          <div className="mt-10 flex justify-center">
            <MagneticButton href={RESERVE_HREF}>
              Get your VHSMO
              <span aria-hidden>→</span>
            </MagneticButton>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
