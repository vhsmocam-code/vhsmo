import type { Metadata } from "next";
import { MagneticButton } from "@/components/brand/MagneticButton";
import { Reveal } from "@/components/brand/Reveal";
import { Scribble } from "@/components/brand/Scribble";
import { AppConnectionGuide } from "@/components/setup/AppConnectionGuide";
import { ChargingGuide } from "@/components/setup/ChargingGuide";
import { SetupHero } from "@/components/setup/SetupHero";
import { SetupProgress } from "@/components/setup/SetupProgress";
import { SetupStep } from "@/components/setup/SetupStep";
import { SetupTips } from "@/components/setup/SetupTips";
import { SetupTroubleshooting } from "@/components/setup/SetupTroubleshooting";
import { SetupVideo } from "@/components/setup/SetupVideo";
import { RESERVE_HREF } from "@/lib/landing";
import { progressSteps, setupSteps, setupVideo } from "@/lib/setup";
import { resolveMedia, resolvePoster } from "@/lib/setup-media";

const description =
  "Set up your VHSMO camera in minutes: switch it on, spot the notification light, press the Wi-Fi button, connect the VHSMO app, charge it and get the most from the battery.";

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
 * The setup guide: hero, full walkthrough video, seven camera steps led by
 * real photos and clips (see public/setup/README.md), then help.
 */
export default function SetupPage() {
  const video = resolveMedia({ slot: setupVideo.slot });
  const sources = video.kind === "video" ? video.sources : [];
  const poster = resolvePoster(setupVideo.posterSlot);

  return (
    <div className="relative overflow-x-clip bg-darkroom text-halide">
      <SetupHero />
      <SetupVideo sources={sources} poster={poster} />

      <SetupProgress items={progressSteps} />
      <SetupStep step={setupSteps[0]!} />
      <SetupStep step={setupSteps[1]!} flip />
      <SetupStep step={setupSteps[2]!} wide />
      <SetupStep step={setupSteps[3]!} />
      <AppConnectionGuide />
      <ChargingGuide />
      <SetupTips />

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
