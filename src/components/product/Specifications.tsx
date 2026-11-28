import { specifications } from "@/lib/products";
import { Reveal } from "@/components/brand/Reveal";

/** The full spec sheet - ruled rows, grouped, same hairlines as the FAQ. */
export function Specifications() {
  return (
    <section id="specs" aria-label="Specifications" className="section paper scroll-mt-20">
      <div className="shell">
        <Reveal>
          <p className="eyebrow text-darkroom/55">Specifications</p>
          <h2 className="display mt-4 text-[clamp(2rem,4vw,3.5rem)] text-darkroom">
            The fine print, in full.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-x-12 gap-y-12 sm:grid-cols-2">
          {specifications.map((group, i) => (
            <Reveal key={group.group} delay={(i % 2) * 0.06}>
              <div>
                <h3 className="text-lg font-bold text-darkroom">{group.group}</h3>
                <dl className="mt-3 border-t border-darkroom/25">
                  {group.items.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-baseline justify-between gap-6 border-b border-darkroom/15 py-3.5"
                    >
                      <dt className="shrink-0 text-sm text-darkroom/60">{item.label}</dt>
                      <dd className="text-right text-[0.95rem] font-medium text-darkroom">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
