import { Reveal } from "@/components/brand/Reveal";
import { charging } from "@/lib/setup";
import { MediaSlot } from "./MediaSlot";

/**
 * Step 06. The two charging LED states, then one big number.
 */
export function ChargingGuide() {
  return (
    <section
      id={charging.id}
      aria-labelledby={`${charging.id}-title`}
      className="section scroll-mt-16"
    >
      <div className="shell">
        <div className="grid grid-cols-12 items-center gap-y-10 lg:gap-x-16">
          <div className="col-span-12 lg:col-span-5">
            <Reveal>
              <span className="font-marker block text-6xl leading-none tabular-nums text-kodak sm:text-7xl">
                {charging.number}
              </span>
              <h2
                id={`${charging.id}-title`}
                className="display mt-5 text-[clamp(2rem,4.4vw,3.8rem)] text-halide"
              >
                {charging.title}
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-halide/75">
                {charging.body}
              </p>
              <ul className="mt-8 max-w-sm divide-y divide-halide/10 border-y border-halide/10">
                {charging.states.map((s) => (
                  <li key={s.id} className="flex items-center gap-4 py-4">
                    <span
                      aria-hidden
                      className={`size-3.5 shrink-0 rounded-full ${s.dot} shadow-[0_0_0_4px_rgba(227,227,225,0.08)]`}
                    />
                    <span className="text-sm font-semibold uppercase tracking-wide text-halide">
                      {s.label}
                    </span>
                    <span className="text-halide/60">{s.meaning}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <div className="col-span-12 mx-auto w-full max-w-xl lg:col-span-6 lg:col-start-7 lg:max-w-none">
            <MediaSlot config={charging.media} />
          </div>
        </div>

        {/* The two LED states, side by side */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:mt-20 sm:grid-cols-2 sm:gap-8">
          {charging.states.map((s) => (
            <figure key={s.id}>
              <MediaSlot config={s.media} sizes="(min-width: 640px) 45vw, 100vw" />
              <figcaption className="mt-4 flex items-center gap-3 text-sm">
                <span aria-hidden className={`size-3 rounded-full ${s.dot}`} />
                <span className="font-semibold uppercase tracking-wide text-halide">
                  {s.label}
                </span>
                <span className="text-halide/60">{s.meaning}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* The number */}
        <Reveal className="mt-20 border-t border-halide/10 pt-14 sm:mt-28 sm:pt-20">
          <div className="grid grid-cols-12 items-end gap-y-6 lg:gap-x-10">
            <p className="display col-span-12 text-[clamp(4.5rem,15vw,12rem)] leading-[0.85] text-kodak lg:col-span-7">
              {charging.photos}
            </p>
            <div className="col-span-12 lg:col-span-5 lg:pb-3">
              <p className="display text-[clamp(1.5rem,3vw,2.4rem)] text-halide">
                photos on one full charge.
              </p>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-halide/65">
                {charging.photosLine}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
