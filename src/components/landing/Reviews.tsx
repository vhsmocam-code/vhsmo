"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/brand/Reveal";
import { Sticker } from "@/components/brand/Sticker";
import { MagneticButton } from "@/components/brand/MagneticButton";
import { RESERVE_HREF, reviews, type Story } from "@/lib/landing";
import { seededRotation } from "@/lib/random";
import { StoryMedia, StoryPreload, StoryViewer } from "./StoryViewer";

/**
 * Reviews = the unboxing stories buyers actually posted. No star ratings, no
 * written testimonials - just the stories, as a swipeable reel of phone-shaped
 * cards that open into a full-screen story player with a buy CTA.
 *
 * The reel lives inside .shell so its first and last visible cards line up with
 * the headline and the sign-off row; extra cards scroll in via the arrows.
 */

function StoryCard({ story, index, eager, onOpen, onWarm }: { story: Story; index: number; eager: boolean; onOpen: () => void; onWarm: () => void }) {
  const reduceMotion = useReducedMotion();
  const rot = seededRotation(index + 41, 2);

  return (
    <li
      className="w-[72vw] max-w-[19rem] shrink-0 snap-start sm:w-[calc((100%-2*1.25rem)/3)] sm:max-w-none sm:[transform:rotate(var(--rot))] lg:w-[calc((100%-3*1.25rem)/4)]"
      style={{ "--rot": `${rot}deg` } as React.CSSProperties}
    >
      <motion.button
        type="button"
        onClick={onOpen}
        onPointerEnter={onWarm}
        onFocus={onWarm}
        onTouchStart={onWarm}
        aria-label={`Open ${story.handle ? `@${story.handle}'s` : "a buyer's"} unboxing story (${story.finish})`}
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        whileHover={reduceMotion ? undefined : { rotate: -rot, y: -6, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className="group relative flex aspect-[9/16] w-full flex-col overflow-hidden rounded-[1.5rem] bg-darkroom-deep text-left shadow-[0.4rem_0.8rem_1.8rem_rgba(0,0,0,0.45)] ring-1 ring-halide/15 transition-shadow duration-300 hover:shadow-[0.5rem_1rem_2.4rem_rgba(0,0,0,0.6)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-kodak"
      >
        <StoryMedia story={story} eager={eager} sizes="(min-width: 640px) 272px, 72vw" quoteClamp />

        {/* Play affordance */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-darkroom-deep/55 text-overexpose opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <svg viewBox="0 0 24 24" className="ml-0.5 size-6 fill-current"><path d="M8 5.5v13l11-6.5z" /></svg>
        </span>

        {/* Who + which finish */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-darkroom-deep/85 via-darkroom-deep/40 to-transparent px-3 pb-3 pt-10">
          <span className="min-w-0 truncate text-sm font-semibold text-overexpose">
            {story.handle ? `@${story.handle}` : ""}
          </span>
          <Sticker size="sm" rotate={-3} className="shrink-0 !px-2.5 !py-0.5 text-xs">
            {story.finish}
          </Sticker>
        </span>
      </motion.button>
    </li>
  );
}

export function Reviews() {
  const { stories } = reviews;
  const [open, setOpen] = useState<number | null>(null);
  const reel = useRef<HTMLUListElement>(null);
  const section = useRef<HTMLElement>(null);

  // Once the section is within ~a screen of the viewport, load every reel card
  // (so scrolling the row never shows empty cards) and warm the viewer-size
  // image of the first few stories (so the first tap opens instantly).
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = section.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "1000px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  // Hover / focus / touch-start on a card warms that story and the next one.
  const [warm, setWarm] = useState<number | null>(null);
  const preload = [
    ...(near ? stories.slice(0, 3) : []),
    ...(warm !== null ? stories.slice(warm, warm + 2) : []),
  ].filter((s, i, all) => all.indexOf(s) === i);

  function scrollReel(dir: 1 | -1) {
    const el = reel.current;
    const card = el?.querySelector("li");
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + 20), behavior: "smooth" });
  }

  return (
    <section ref={section} id="reviews" aria-label="Reviews" className="section relative scroll-mt-20 overflow-hidden bg-darkroom text-halide">
      <div className="shell">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <Reveal className="min-w-0">
            <p className="font-marker flex items-center gap-2 text-sm uppercase tracking-wide text-kodak sm:text-base">
              <span className="size-2.5 animate-pulse rounded-full bg-[#ff3b30]" aria-hidden />
              {reviews.eyebrow}
            </p>
            <h2 className="display mt-4 text-[clamp(2.4rem,6.4vw,5.25rem)] leading-[0.92] text-overexpose">
              {reviews.headline}{" "}
              <span className="font-marker inline-block -rotate-2 bg-kodak px-3 leading-none text-darkroom shadow-[0.15rem_0.25rem_0_rgba(0,0,0,0.35)]">
                {reviews.highlight}
              </span>
            </h2>
            <p className="font-marker measure mt-6 text-[clamp(1.05rem,1.8vw,1.35rem)] leading-relaxed text-halide/80">
              {reviews.sub}
            </p>
          </Reveal>

          <div className="flex items-center gap-4">
            <div className="hidden gap-2 md:flex">
              {([-1, 1] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => scrollReel(dir)}
                  aria-label={dir < 0 ? "Scroll stories left" : "Scroll stories right"}
                  className="grid size-12 place-items-center rounded-full border-2 border-halide/30 text-2xl text-overexpose transition-colors hover:border-kodak hover:bg-kodak hover:text-darkroom"
                >
                  {dir < 0 ? "‹" : "›"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* The reel. py gives tilted cards + hover lift room inside the scroller. */}
      <div className="shell mt-12 lg:mt-14">
        <ul
          ref={reel}
          className="no-scrollbar -mx-3 -mr-[calc(1.375rem+0.75rem)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-3 py-6 [scroll-padding-inline:0.75rem] sm:-mr-3 sm:gap-5"
        >
          {stories.map((story, i) => (
            <StoryCard key={story.src} story={story} index={i} eager={near} onWarm={() => setWarm(i)} onOpen={() => setOpen(i)} />
          ))}
        </ul>
      </div>

      <div className="shell">
        <Reveal className="mt-10 flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <a
            href={reviews.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="font-marker inline-block max-w-full -rotate-1 text-balance bg-kodak px-4 py-2 text-center text-base uppercase tracking-wide text-darkroom shadow-[0.2rem_0.35rem_0_rgba(0,0,0,0.35)] transition-transform hover:rotate-0 sm:px-6 sm:text-lg"
          >
            {reviews.signOff}
          </a>
          <MagneticButton href={RESERVE_HREF}>{reviews.cta} →</MagneticButton>
        </Reveal>
      </div>

      {open === null && <StoryPreload stories={preload} />}
      <StoryViewer stories={stories} index={open} onIndexChange={setOpen} onClose={() => setOpen(null)} />
    </section>
  );
}
