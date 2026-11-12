import { Reveal } from "@/components/brand/Reveal";
import { tips } from "@/lib/setup";

/**
 * Step 07. Four short reminders, set as type on paper - no cards.
 */
export function SetupTips() {
  return (
    <section
      id={tips.id}
      aria-labelledby={`${tips.id}-title`}
      className="section-lg scroll-mt-16 bg-darkroom-deep"
    >
      <div className="shell">
        <Reveal className="max-w-2xl">
          <span className="font-marker block text-6xl leading-none tabular-nums text-kodak sm:text-7xl">
            {tips.number}
          </span>
          <h2
            id={`${tips.id}-title`}
            className="display mt-5 text-[clamp(2rem,4.8vw,4.2rem)] text-halide"
          >
            {tips.title}
          </h2>
        </Reveal>

        <ul className="mt-14 grid gap-x-14 gap-y-12 sm:mt-20 sm:grid-cols-2">
          {tips.items.map((tip, i) => (
            <li key={tip.title}>
              <Reveal delay={(i % 2) * 0.08}>
                <div className="border-t-2 border-kodak pt-5">
                  <span className="font-marker text-lg tabular-nums text-kodak">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="display mt-2 text-[clamp(1.5rem,2.6vw,2.1rem)] text-halide">
                    {tip.title}
                  </h3>
                  <p className="mt-4 max-w-sm text-base leading-relaxed text-halide/70">
                    {tip.body}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
