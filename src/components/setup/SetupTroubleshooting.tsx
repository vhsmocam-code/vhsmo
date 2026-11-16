import { Reveal } from "@/components/brand/Reveal";
import { StoreBadges } from "./StoreBadges";

/**
 * The closing help block: a short "any questions?" note with the ways to
 * reach the team, a nudge to tag us, and the app links.
 */
export function SetupTroubleshooting() {
  return (
    <section
      id="help"
      aria-labelledby="help-title"
      className="section paper scroll-mt-20"
    >
      <div className="shell">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-darkroom/55">Help</p>
          <h2
            id="help-title"
            className="display mt-5 text-[clamp(2.2rem,4vw,4.5rem)] text-darkroom"
          >
            Any questions?
          </h2>
          <p className="font-marker mt-8 rotate-[-2deg] text-lg text-darkroom/70">
            DM us on
            <a
              href="https://instagram.com/vhsmo.cam_"
              target="_blank"
              rel="noreferrer"
              className="mx-auto mt-1 block w-fit bg-kodak px-1 py-1 text-darkroom transition-colors hover:text-bluehour"
            >
              @vhsmo.cam_
            </a>
            <span className="mt-2 block">or write to us at</span>
            <a
              href="mailto:team@vhsmo.com"
              className="mx-auto mt-1 block w-fit bg-kodak px-1 py-1 text-darkroom transition-colors hover:text-bluehour"
            >
              team@vhsmo.com
            </a>
          </p>
          <p className="mx-auto mt-8 max-w-sm text-sm leading-relaxed text-darkroom/70">
            We&apos;d love to see the world through your VHSMO. Tag{" "}
            <a
              href="https://www.instagram.com/vhsmo.cam_/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-darkroom underline underline-offset-4"
            >
              @vhsmo.cam_
            </a>{" "}
            in your favourite memories.
          </p>
          <div className="mt-10 flex flex-col items-center">
            <p className="eyebrow mb-3 text-darkroom/55">Get the app</p>
            <StoreBadges tone="light" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
