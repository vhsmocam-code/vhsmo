import { Reveal } from "@/components/brand/Reveal";
import type { SetupStepContent } from "@/lib/setup";
import { cn } from "@/lib/utils";
import { MediaSlot } from "./MediaSlot";

/**
 * One setup step: a big marker numeral, a short heading, a line or two,
 * and one large piece of media. `flip` swaps the sides; `wide` stacks the
 * text above a full-width image for the "you're ready" moment.
 */
export function SetupStep({
  step,
  flip,
  wide,
}: {
  step: SetupStepContent;
  flip?: boolean;
  wide?: boolean;
}) {
  const text = (
    <Reveal className={cn(wide && "mx-auto max-w-2xl text-center")}>
      <span className="font-marker block text-6xl leading-none tabular-nums text-kodak sm:text-7xl">
        {step.number}
      </span>
      <h2
        id={`${step.id}-title`}
        className="display mt-5 text-[clamp(2rem,4.4vw,3.8rem)] text-halide"
      >
        {step.title}
      </h2>
      <p
        className={cn(
          "mt-6 max-w-md text-lg leading-relaxed text-halide/75",
          wide && "mx-auto",
        )}
      >
        {step.body}
      </p>
      {step.note && (
        <p className="mt-6 max-w-md border-l-2 border-kodak pl-4 text-sm leading-relaxed text-halide/60">
          {step.note}
        </p>
      )}
    </Reveal>
  );

  return (
    <section
      id={step.id}
      aria-labelledby={`${step.id}-title`}
      className="section scroll-mt-16"
    >
      <div className="shell">
        {wide ? (
          <div className="flex flex-col gap-12 sm:gap-16">
            {text}
            <MediaSlot config={step.media} sizes="(min-width: 1280px) 1200px, 100vw" />
          </div>
        ) : (
          <div className="grid grid-cols-12 items-center gap-y-10 lg:gap-x-16">
            <div
              className={cn(
                "col-span-12 lg:col-span-5",
                flip ? "lg:order-2 lg:col-start-8" : "lg:order-1",
              )}
            >
              {text}
            </div>
            <div
              className={cn(
                "col-span-12 mx-auto w-full max-w-xl lg:col-span-6 lg:max-w-none",
                flip ? "lg:order-1" : "lg:order-2 lg:col-start-7",
              )}
            >
              <MediaSlot config={step.media} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
