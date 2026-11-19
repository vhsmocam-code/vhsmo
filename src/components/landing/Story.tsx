import Image from "next/image";
import { Send } from "lucide-react";
import { Reveal } from "@/components/brand/Reveal";
import { Scribble } from "@/components/brand/Scribble";
import { story, YEAR_MARK } from "@/lib/landing";
import { seededRotation } from "@/lib/random";

type StoryPhoto = NonNullable<(typeof story.photos)[number]>;

/** Ink asterisk doodle. */
function AsteriskDoodle({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Frame used only in this spread: a clean pinned print - white border,
 * one strip of tape, caption underlined in yellow marker, and the
 * one-line story beneath. Straightens slightly on hover.
 */
function PinnedPrint({
  photo,
  rotate,
  sizes,
  circle,
}: {
  photo: StoryPhoto;
  rotate: number;
  sizes: string;
  /** Sentence inside `story` to circle in ink, if present. */
  circle?: string;
}) {
  const circleAt = circle ? photo.story.indexOf(circle) : -1;

  return (
    <figure
      className="group relative bg-overexpose p-2.5 pb-4 shadow-[0.25rem_0.5rem_1.1rem_rgba(31,26,24,0.22)] transition-transform duration-300 ease-[var(--ease-out-expo)] hover:rotate-0 hover:scale-[1.015] sm:p-3 sm:pb-5"
      style={{ rotate: `${rotate}deg` }}
    >
      <span aria-hidden className="tape -top-3 left-1/2 -translate-x-1/2 -rotate-2" />
      <Image
        src={photo.src}
        alt={photo.alt}
        width={1024}
        height={768}
        sizes={sizes}
        className="block h-auto w-full"
      />
      <figcaption className="px-1 pt-4">
        <span className="font-marker relative inline-block pb-1 text-base leading-tight text-darkroom sm:text-lg">
          {photo.caption}
          <Scribble />
        </span>
        <span className="mt-2.5 block text-sm leading-snug text-darkroom/75">
          {circleAt >= 0 && circle ? (
            <>
              {photo.story.slice(0, circleAt)}
              {/* The nowrap + ink ellipse only fits once the cards are wide
                  enough - on phones the sentence wraps like normal text. */}
              <span className="relative inline sm:inline-block sm:whitespace-nowrap">
                {circle}
                <span
                  aria-hidden
                  className="absolute -inset-x-2 -inset-y-1 hidden -rotate-1 rounded-[50%] border-[1.5px] border-darkroom/80 sm:block"
                />
              </span>
              {photo.story.slice(circleAt + circle.length)}
            </>
          ) : (
            photo.story
          )}
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * The "why" spread - argument on the left page; a neat corkboard of
 * pinned prints, doodles, and a promise note on the right.
 */
export function Story() {
  const [firstShot, cheque, mentors, onTheMap, wires, dormHQ] = story.photos;

  // Six prints, three columns. The middle and right columns drop down a
  // little so the wall reads pinned-up rather than gridded, but every gutter
  // stays even. The "on the map" print carries the circled line.
  const corkboard: {
    photo?: StoryPhoto;
    seed: number;
    from: number;
    offset?: string;
    circle?: string;
  }[] = [
    { photo: firstShot, seed: 23, from: -5 },
    { photo: cheque, seed: 31, from: 4, offset: "sm:mt-10" },
    { photo: mentors, seed: 41, from: -3, offset: "sm:mt-4" },
    {
      photo: onTheMap,
      seed: 53,
      from: 4,
      offset: "sm:-mt-2",
    },
    { photo: wires, seed: 17, from: -4, offset: "sm:mt-8" },
    { photo: dormHQ, seed: 11, from: 3, offset: "sm:mt-2" },
  ];

  return (
    <section
      id="story"
      aria-label="Why VHSMO exists"
      className="paper relative overflow-hidden"
    >
      <div className="shell section-lg">
        <div className="grid grid-cols-12 gap-y-16 lg:gap-x-12">
          {/* Left page - the argument */}
          <div className="col-span-12 lg:col-span-4">
            <h2 className="display text-[clamp(2.1rem,3.4vw,3.6rem)] text-darkroom">
              Cameras got smarter.
              <br />
              Photos got{" "}
              <span className="font-marker relative inline-block font-normal tracking-normal">
                emptier.
                <Scribble />
              </span>
            </h2>

            <div className="mt-10 max-w-prose">
              {story.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 24)}
                  className="mt-6 text-base leading-relaxed text-darkroom/90 first:mt-0 sm:text-lg sm:leading-loose"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Right page - the corkboard. Five distinct prints on a 3-column
              grid; columns stagger vertically for a pinned-up feel while the
              gutters stay perfectly even. */}
          <div className="relative col-span-12 lg:col-span-8">
            <AsteriskDoodle className="absolute -top-8 right-0 z-10 h-8 w-8 rotate-12 text-darkroom" />

            <div className="mx-auto grid max-w-[20rem] grid-cols-1 gap-8 min-[480px]:max-w-none min-[480px]:grid-cols-2 min-[480px]:gap-5 sm:grid-cols-3 sm:gap-8">
              {corkboard.map(({ photo, seed, from, circle, offset }, i) =>
                photo ? (
                  <Reveal
                    key={i}
                    delay={(i % 3) * 0.08}
                    fromRotate={from}
                    className={offset}
                  >
                    <PinnedPrint
                      photo={photo}
                      rotate={seededRotation(seed, 1.6)}
                      sizes="(min-width: 1024px) 18vw, (min-width: 480px) 45vw, 80vw"
                      circle={circle}
                    />
                  </Reveal>
                ) : null,
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
