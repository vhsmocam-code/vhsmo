"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Play } from "lucide-react";
import { Reveal } from "@/components/brand/Reveal";
import { setupVideo } from "@/lib/setup";
import { WalkthroughAnimation } from "./WalkthroughAnimation";

/**
 * The full walkthrough. Shows only the poster until the visitor presses
 * play, then mounts a real <video> with native (keyboard-friendly)
 * controls. Nothing autoplays. Until a video file exists it plays the
 * drawn walkthrough animation instead.
 */
export function SetupVideo({
  sources,
  poster,
}: {
  sources: { src: string; type: string }[];
  poster?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  const hasVideo = sources.length > 0;

  function start() {
    setPlaying(true);
    requestAnimationFrame(() => void ref.current?.play().catch(() => {}));
  }

  return (
    <section
      id="video"
      aria-labelledby="video-title"
      className="section-lg scroll-mt-16"
    >
      <div className="shell">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-kodak">{setupVideo.eyebrow}</p>
          <h2
            id="video-title"
            className="display mt-5 text-[clamp(2rem,4.8vw,4rem)] text-halide"
          >
            {setupVideo.title}
          </h2>
          <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-halide/75">
            {setupVideo.body}
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12 sm:mt-16">
          {!hasVideo ? (
            <WalkthroughAnimation />
          ) : (
            <div className="relative mx-auto aspect-video w-full max-w-5xl overflow-hidden rounded-[1.25rem] bg-darkroom-deep ring-1 ring-halide/10">
              {playing && hasVideo ? (
                <video
                  ref={ref}
                  controls
                  playsInline
                  preload="none"
                  poster={poster}
                  aria-label={setupVideo.alt}
                  className="absolute inset-0 h-full w-full bg-black object-contain"
                >
                  {sources.map((s) => (
                    <source key={s.src} src={s.src} type={s.type} />
                  ))}
                </video>
              ) : (
                <>
                  {poster ? (
                    <Image
                      src={poster}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 64rem, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-3 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-halide/25 bg-[repeating-linear-gradient(135deg,transparent_0_14px,rgba(227,227,225,0.04)_14px_15px)] text-center">
                      <span className="eyebrow text-kodak">
                        {hasVideo ? "Thumbnail needed" : "Video needed"}
                      </span>
                      <span className="text-sm text-halide/80">{setupVideo.brief}</span>
                      <code className="text-[0.7rem] text-halide/45">
                        public/setup/{setupVideo.slot}.mp4 · public/setup/
                        {setupVideo.posterSlot}.jpg
                      </code>
                    </div>
                  )}
                  {hasVideo && (
                    <button
                      type="button"
                      onClick={start}
                      aria-label="Play setup video"
                      className="group absolute inset-0 grid place-items-center focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-kodak"
                    >
                      <span className="grid size-20 place-items-center rounded-full bg-kodak text-darkroom shadow-[0_1rem_2.5rem_-0.5rem_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-105 sm:size-24">
                        <Play className="ml-1 size-8 fill-current" aria-hidden />
                      </span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
