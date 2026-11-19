import Image from "next/image";
import { Reveal } from "@/components/brand/Reveal";
import { MagneticButton } from "@/components/brand/MagneticButton";
import { finalCta, RESERVE_HREF } from "@/lib/landing";

/**
 * The ending. A scrapbook collage on white - a blue "welcome to the
 * club" panel, the yellow manifesto note, and one wide dark bar holding
 * the Kids Word sign-off beside a taped field photograph.
 */
export function FinalCta() {
  return (
    <section
      aria-label="Reserve your VHSMO"
      className="section-sm paper"
    >
      <div className="shell">
        <Reveal>
          <div className="flex flex-col gap-4 sm:gap-5">
            {/* Top row - blue welcome + yellow manifesto */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              {/* Blue panel */}
              <div className="relative flex flex-col justify-center gap-6 overflow-hidden bg-bluehour p-6 sm:p-8 md:min-h-[18rem] lg:aspect-[16/10]">
                <svg
                  aria-hidden
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  viewBox="0 0 800 500"
                  preserveAspectRatio="xMidYMid slice"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <filter
                      id="vhsmo-marble"
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%"
                    >
                      <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.008 0.012"
                        numOctaves="5"
                        seed="14"
                        result="noise"
                      />
                      {/* collapse to one field and stretch its contrast so the
                          full blue ramp (not just the mid tones) gets used */}
                      <feColorMatrix
                        in="noise"
                        type="matrix"
                        values="1.9 0 0 0 -0.45  1.9 0 0 0 -0.45  1.9 0 0 0 -0.45  0 0 0 0 1"
                        result="gray"
                      />
                      {/* map the field through the blue marble ramp */}
                      <feComponentTransfer in="gray" result="bands">
                        <feFuncR
                          type="table"
                          tableValues="0.184 0.310 0.357 0.165 0.435 0.184"
                        />
                        <feFuncG
                          type="table"
                          tableValues="0.373 0.608 0.361 0.282 0.706 0.373"
                        />
                        <feFuncB
                          type="table"
                          tableValues="0.902 0.949 0.941 0.847 0.961 0.902"
                        />
                      </feComponentTransfer>
                      {/* brushy oil-paint smear */}
                      <feTurbulence
                        type="turbulence"
                        baseFrequency="0.03 0.05"
                        numOctaves="2"
                        seed="5"
                        result="fine"
                      />
                      <feDisplacementMap
                        in="bands"
                        in2="fine"
                        scale="18"
                        xChannelSelector="R"
                        yChannelSelector="G"
                      />
                    </filter>
                  </defs>
                  <rect
                    x="-40"
                    y="-40"
                    width="880"
                    height="580"
                    filter="url(#vhsmo-marble)"
                  />
                </svg>

                <h3 className="font-marker relative z-10 -rotate-[4deg] text-left text-[clamp(1.5rem,4.5vw,2.6rem)] leading-[0.95] text-overexpose drop-shadow-[0.12rem_0.2rem_0_rgba(31,26,24,0.35)]">
                  {finalCta.lineOne}
                  <br />
                  {finalCta.lineTwo}
                  <br />
                  {finalCta.lineThree}
                </h3>
                <div className="relative z-10 self-end">
                  <MagneticButton
                    href={RESERVE_HREF}
                    className="px-5 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base"
                  >
                    {finalCta.cta}
                    <span aria-hidden>→</span>
                  </MagneticButton>
                </div>
              </div>

              {/* Yellow panel */}
              <div className="flex flex-col justify-between bg-kodak p-6 sm:p-8 md:min-h-[18rem] lg:aspect-[16/10]">
                <div className="flex max-w-xl flex-col gap-4 text-[clamp(1.15rem,1.9vw,1.7rem)] font-semibold leading-[1.2] tracking-tight text-darkroom">
                  <p>{finalCta.population}</p>
                  <p>
                    {finalCta.closer}
                    <br />
                    {finalCta.welcomeLine}
                  </p>
                </div>
                <span
                  aria-hidden
                  className="font-marker mt-6 self-end text-2xl text-darkroom sm:text-3xl -rotate-[15deg]"
                >
                  {finalCta.wordmark}
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
