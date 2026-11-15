import { Reveal } from "@/components/brand/Reveal";
import { inside } from "@/lib/setup";
import { MediaSlot } from "./MediaSlot";

/**
 * Unnumbered strip after the video: the memory card is already in the
 * camera, and it holds 2,500+ photos.
 */
export function SetupInside() {
  return (
    <section
      id={inside.id}
      aria-labelledby={`${inside.id}-title`}
      className="section-sm scroll-mt-16"
    >
      <div className="shell">
        <div className="grid grid-cols-12 items-center gap-y-10 lg:gap-x-16">
          <div className="col-span-12 lg:col-span-5">
            <Reveal>
              <p className="eyebrow text-kodak">{inside.eyebrow}</p>
              <h2
                id={`${inside.id}-title`}
                className="display mt-5 text-[clamp(2rem,4.4vw,3.8rem)] text-halide"
              >
                {inside.title}
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-halide/75">
                {inside.body}
              </p>
              <p className="mt-8 flex items-baseline gap-4 border-t border-halide/15 pt-6">
                <span className="display text-[clamp(2.4rem,5vw,3.6rem)] leading-none text-kodak">
                  {inside.stat}
                </span>
                <span className="text-sm uppercase tracking-wide text-halide/60">
                  {inside.statLabel}
                </span>
              </p>
            </Reveal>
          </div>
          <div className="col-span-12 mx-auto w-full max-w-xl lg:col-span-6 lg:col-start-7 lg:max-w-none">
            <MediaSlot config={inside.media} />
          </div>
        </div>
      </div>
    </section>
  );
}
