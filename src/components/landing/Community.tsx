"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/brand/Reveal";

/**
 * The community wall as a scrapbook: every real DM / comment / email screenshot
 * pinned to a paper board. A balanced masonry keeps each note fully readable,
 * while a small per-note tilt keeps the pile feeling hand-arranged rather than
 * gridded. Paper + darkroom + kodak only; hand-lettering is the marker face.
 *
 * Masonry via CSS columns (1 → 2 → 3 → 4 across breakpoints); each note is
 * break-inside-avoid so it never splits across a column. Tilt lives on a static
 * wrapper so it can't fight framer's opacity/y entrance or hover-lift.
 */

type Note = {
  src: string;
  /** Intrinsic height (sources are ~1170px wide) - keeps the aspect box. */
  ih: number;
  /** Resting tilt in degrees; springs back to 0 on hover. */
  rot: number;
};

const IW = 1170;

// Every real screenshot, laid into a readable masonry. rot is a gentle,
// hand-picked tilt (kept ≤2.2°) so the wall reads as pinned, not clipped.
const notes: Note[] = [
  { src: "/community-notes/IMG_9256.jpg", ih: 1160, rot: -2 },
  { src: "/community-notes/IMG_6457.PNG", ih: 1080, rot: 1.6 },
  { src: "/community-notes/IMG_9251.jpg", ih: 758, rot: 1.8 },
  { src: "/community-notes/IMG_5884.PNG", ih: 223, rot: -1.2 },
  { src: "/community-notes/IMG_6456.PNG", ih: 527, rot: -1.8 },
  { src: "/community-notes/IMG_9253.jpg", ih: 495, rot: 1.5 },
  { src: "/community-notes/IMG_9248.jpg", ih: 1186, rot: 1.4 },
  { src: "/community-notes/IMG_9254.jpg", ih: 589, rot: -1.5 },
  { src: "/community-notes/IMG_5876.PNG", ih: 423, rot: -2 },
  { src: "/community-notes/IMG_6453.PNG", ih: 289, rot: 2 },
  { src: "/community-notes/IMG_9258.jpg", ih: 402, rot: -1.5 },
  { src: "/community-notes/IMG_6459.PNG", ih: 909, rot: -1.6 },
  { src: "/community-notes/IMG_9257.jpg", ih: 571, rot: 1.4 },
  { src: "/community-notes/IMG_5878.PNG", ih: 207, rot: 2 },
  { src: "/community-notes/IMG_9249.jpg", ih: 488, rot: 1.7 },
  { src: "/community-notes/IMG_6460.PNG", ih: 2532, rot: 1 },
  { src: "/community-notes/IMG_9252.jpg", ih: 637, rot: 1.5 },
  { src: "/community-notes/IMG_5886.PNG", ih: 217, rot: 1.3 },
  { src: "/community-notes/IMG_9255.jpg", ih: 524, rot: -1.3 },
  { src: "/community-notes/IMG_6454.PNG", ih: 277, rot: 1.2 },
  { src: "/community-notes/IMG_5879.PNG", ih: 315, rot: 2 },
  { src: "/community-notes/IMG_9250.jpg", ih: 472, rot: -1.8 },
  { src: "/community-notes/IMG_5883.PNG", ih: 212, rot: -1.4 },
  { src: "/community-notes/IMG_6455.PNG", ih: 256, rot: -2 },
  { src: "/community-notes/IMG_5877.PNG", ih: 319, rot: -1.6 },
  { src: "/community-notes/IMG_7793.jpg", ih: 425, rot: 1.5 },
  { src: "/community-notes/IMG_6458.PNG", ih: 399, rot: -2 },
];

function CommunityNote({ note, hideOnMobile }: { note: Note; hideOnMobile?: boolean }) {
  const reduceMotion = useReducedMotion();

  // Rotation lives on a CSS var and is only applied from sm up: phones stay
  // upright and edge-safe (no tilted corner clipping into the tight margins),
  // while wider screens get the hand-pinned scrapbook tilt.
  // hideOnMobile collapses overflow notes on phones only; from sm up (normal
  // desktop view) every note stays visible via sm:block.
  return (
    <figure
      style={{ "--rot": `${note.rot}deg` } as React.CSSProperties}
      className={`mb-3 break-inside-avoid select-none sm:mb-4 sm:block sm:[transform:rotate(var(--rot))] ${
        hideOnMobile ? "hidden" : "block"
      }`}
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        whileHover={reduceMotion ? undefined : { scale: 1.03, y: -3 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className="overflow-hidden rounded-xl bg-darkroom-deep shadow-[0.2rem_0.35rem_0.8rem_rgba(31,26,24,0.22)] ring-1 ring-darkroom/15 transition-shadow duration-300 hover:shadow-[0.4rem_0.7rem_1.5rem_rgba(31,26,24,0.4)]"
      >
        <Image
          src={note.src}
          alt="A message from the VHSMO community"
          width={IW}
          height={note.ih}
          sizes="(min-width: 1280px) 19vw, (min-width: 1024px) 24vw, (min-width: 768px) 31vw, 47vw"
          className="block h-auto w-full"
        />
      </motion.div>
    </figure>
  );
}

// Mobile-only paging so the wall doesn't scroll forever on phones:
// first MOBILE_LIMIT show up front, "See all" expands to MOBILE_MAX, and the
// remaining notes stay in the normal (sm+) desktop view.
const MOBILE_LIMIT = 11;
const MOBILE_MAX = 23;

export function Community() {
  const [showAll, setShowAll] = useState(false);
  const mobileCap = showAll ? MOBILE_MAX : MOBILE_LIMIT;

  return (
    <section
      id="community"
      aria-label="Community"
      className="section paper relative overflow-hidden"
    >
      <div className="shell relative z-10">
        <div className="flex items-start justify-between gap-6">
          <Reveal className="min-w-0">
            <h2 className="display text-[clamp(2.3rem,5.6vw,4.75rem)] leading-[0.92] text-darkroom">
              Fuelled by{" "}
              <span className="font-marker inline-block -rotate-2 bg-kodak px-3 leading-none text-darkroom shadow-[0.15rem_0.25rem_0_rgba(31,26,24,0.25)]">
                hype
              </span>{" "}
              &amp; culture.
            </h2>

            <div className="font-marker mt-8 text-[clamp(1.05rem,1.8vw,1.4rem)] leading-relaxed text-darkroom/80">
              <p>
                Every screenshot below is real — the DMs, comments and emails you
                keep sending us. No filters, no scripts.
              </p>
              <p className="mt-2">
                <span className="inline-block -rotate-1 bg-kodak px-2 text-darkroom">
                  Just people who get it.
                </span>
              </p>
            </div>
          </Reveal>
        </div>

        {/* The wall - a clean, evenly-spaced scrapbook masonry. Mobile-first:
            2 readable columns on phones, scaling 2 → 3 → 4 → 5 with the gap
            (column-gap) matched to each note's mb so spacing stays uniform. */}
        <div className="mt-12 columns-2 [column-gap:0.75rem] md:columns-3 lg:mt-16 lg:columns-4 lg:[column-gap:1rem] xl:columns-5">
          {notes.map((note, i) => (
            <CommunityNote
              key={note.src}
              note={note}
              hideOnMobile={i >= mobileCap}
            />
          ))}
        </div>

        {/* See all - phones only; expands the mobile wall to MOBILE_MAX */}
        {!showAll && (
          <div className="mt-8 flex justify-center sm:hidden">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="font-marker inline-block rounded-full border-2 border-darkroom px-6 py-2.5 text-sm uppercase tracking-wide text-darkroom transition-colors hover:bg-darkroom hover:text-paper"
            >
              See all
            </button>
          </div>
        )}

        {/* Sign-off - marker highlight bar */}
        <Reveal className="mt-10 flex justify-center">
          <span className="font-marker inline-block -rotate-1 bg-kodak px-6 py-2 text-lg uppercase tracking-wide text-darkroom shadow-[0.2rem_0.35rem_0_rgba(31,26,24,0.3)] sm:text-xl">
            tag @vhsmo.cam_ — we print our favourites
          </span>
        </Reveal>
      </div>
    </section>
  );
}
