import { RefreshCw } from "lucide-react";
import { Reveal } from "@/components/brand/Reveal";
import { appGuide } from "@/lib/setup";
import { JoinDetails } from "./JoinDetails";
import { MediaSlot } from "./MediaSlot";
import { PhoneFrame } from "./PhoneFrame";
import { StoreBadges } from "./StoreBadges";

/**
 * Step 05. A camera visual up top, then the real app screens in order so
 * people can follow the connection one tap at a time.
 */
export function AppConnectionGuide() {
  return (
    <section
      id={appGuide.id}
      aria-labelledby={`${appGuide.id}-title`}
      className="section scroll-mt-16"
    >
      <div className="shell">
        <div className="grid grid-cols-12 items-center gap-y-10 lg:gap-x-16">
          <div className="col-span-12 lg:order-2 lg:col-span-5 lg:col-start-8">
            <Reveal>
              <span className="font-marker block text-6xl leading-none tabular-nums text-kodak sm:text-7xl">
                {appGuide.number}
              </span>
              <h2
                id={`${appGuide.id}-title`}
                className="display mt-5 text-[clamp(2rem,4.4vw,3.8rem)] text-halide"
              >
                {appGuide.title}
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-halide/75">
                {appGuide.body}
              </p>
              <StoreBadges className="mt-8" />
            </Reveal>
          </div>
          <div className="col-span-12 mx-auto w-full max-w-xl lg:order-1 lg:col-span-6 lg:max-w-none">
            <MediaSlot config={appGuide.media} />
          </div>
        </div>

        {/* The in-app sequence */}
        <ol className="no-scrollbar -mx-[clamp(1.375rem,4vw,5rem)] mt-20 flex snap-x snap-mandatory gap-6 overflow-x-auto px-[clamp(1.375rem,4vw,5rem)] pb-4 sm:mt-28 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-5 lg:overflow-visible lg:px-0">
          {appGuide.screens.map((s, i) => (
            <li
              key={s.n}
              className="group w-[62%] shrink-0 snap-center sm:w-[40%] lg:w-auto"
            >
              <Reveal delay={i * 0.06}>
                <div className="flex items-center gap-3 border-t border-halide/15 pt-4">
                  <span className="font-marker text-2xl tabular-nums text-kodak">
                    {s.n}
                  </span>
                  <h3 className="text-sm font-semibold leading-tight text-halide">
                    {s.title}
                  </h3>
                </div>
                <div className="mx-auto mt-5 w-full max-w-[14rem] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5">
                  <PhoneFrame src={s.src} alt={s.alt} />
                </div>
                <p className="mx-auto mt-5 max-w-[14rem] text-sm leading-relaxed text-halide/60">
                  {s.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>

        {/* First connection: compulsory firmware update */}
        <Reveal className="mx-auto mt-16 max-w-3xl">
          <div className="border-2 border-kodak/70 bg-darkroom-deep/60 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <RefreshCw aria-hidden className="size-5 text-kodak" />
              <span className="eyebrow text-kodak">{appGuide.firmware.tag}</span>
            </div>
            <h3 className="display mt-4 text-[clamp(1.5rem,3vw,2.2rem)] text-halide">
              {appGuide.firmware.title}
            </h3>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-halide/75">
              {appGuide.firmware.body}
            </p>
            <ul className="mt-6 flex flex-col gap-3 text-sm leading-relaxed text-halide/80 sm:text-base">
              {appGuide.firmware.points.map((point) => (
                <li key={point} className="flex gap-3">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-kodak" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal className="mx-auto mt-14 max-w-md">
          <JoinDetails />
        </Reveal>
      </div>
    </section>
  );
}
