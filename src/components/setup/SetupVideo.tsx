"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { Reveal } from "@/components/brand/Reveal";
import { setupVideo } from "@/lib/setup";

/**
 * The setup walkthrough, hosted on YouTube. Only the thumbnail loads until
 * the visitor presses play, then the privacy-enhanced player replaces it
 * and starts. Nothing autoplays and no YouTube script runs before that.
 */
export function SetupVideo() {
  const [playing, setPlaying] = useState(false);
  const id = setupVideo.youtubeId;

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
          <div className="relative mx-auto aspect-video w-full max-w-5xl overflow-hidden rounded-[1.25rem] bg-darkroom-deep ring-1 ring-halide/10">
            {playing ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={setupVideo.alt}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 h-full w-full border-0"
              />
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
                  onError={(e) => {
                    const img = e.currentTarget;
                    const fallback = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
                    if (img.src !== fallback) img.src = fallback;
                  }}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-darkroom/30" aria-hidden />
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  aria-label="Play setup video"
                  className="group absolute inset-0 grid place-items-center focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-kodak"
                >
                  <span className="grid size-20 place-items-center rounded-full bg-kodak text-darkroom shadow-[0_1rem_2.5rem_-0.5rem_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-105 sm:size-24">
                    <Play className="ml-1 size-8 fill-current" aria-hidden />
                  </span>
                </button>
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
