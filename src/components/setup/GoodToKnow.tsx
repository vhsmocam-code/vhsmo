import { Reveal } from "@/components/brand/Reveal";
import { goodToKnow } from "@/lib/setup";
import { cn } from "@/lib/utils";
import { MediaSlot } from "./MediaSlot";
import { NoteCallout } from "./NoteCallout";

/**
 * Unnumbered section after the tips: the USB route for big batches of
 * photos, and the reset button for the rare stuck camera.
 */
export function GoodToKnow() {
  return (
    <section
      id={goodToKnow.id}
      aria-labelledby={`${goodToKnow.id}-title`}
      className="section scroll-mt-16"
    >
      <div className="shell">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-kodak">{goodToKnow.eyebrow}</p>
          <h2
            id={`${goodToKnow.id}-title`}
            className="display mt-5 text-[clamp(2rem,4.4vw,3.8rem)] text-halide"
          >
            {goodToKnow.title}
          </h2>
        </Reveal>

        <div className="mt-14 flex flex-col gap-20 sm:mt-20 sm:gap-28">
          {goodToKnow.items.map((item, i) => (
            <div
              key={item.id}
              id={item.id}
              className="grid scroll-mt-20 grid-cols-12 items-center gap-y-10 lg:gap-x-16"
            >
              <div
                className={cn(
                  "col-span-12 lg:col-span-5",
                  i % 2 === 1 ? "lg:order-2 lg:col-start-8" : "lg:order-1",
                )}
              >
                <Reveal>
                  <h3 className="display text-[clamp(1.7rem,3.4vw,2.8rem)] text-halide">
                    {item.title}
                  </h3>
                  <p className="mt-5 max-w-md text-lg leading-relaxed text-halide/75">
                    {item.body}
                  </p>
                  {item.note && item.noteIcon && (
                    <NoteCallout icon={item.noteIcon} className="mt-8">
                      {item.note}
                    </NoteCallout>
                  )}
                </Reveal>
              </div>
              <div
                className={cn(
                  "col-span-12 mx-auto w-full max-w-xl lg:col-span-6 lg:max-w-none",
                  i % 2 === 1 ? "lg:order-1" : "lg:order-2 lg:col-start-7",
                )}
              >
                <MediaSlot config={item.media} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
