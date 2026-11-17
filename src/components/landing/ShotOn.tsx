"use client";

import Image from "next/image";
import { Marquee } from "@/components/brand/Marquee";
import { Reveal } from "@/components/brand/Reveal";
import { Scribble } from "@/components/brand/Scribble";
import { shotOn } from "@/lib/landing";
import { useEffect, useRef } from "react";

/** One auto-scrolling row of photos.
 *
 *  The strip is rendered twice and the track is offset by
 *  `offset % halfWidth` every frame, so the position is recomputed from a
 *  wrapped value instead of being *accumulated* - it can never drift, and a
 *  wrap is a no-op because the second half sits exactly where the first was.
 *
 *  Spacing lives in each item's horizontal padding rather than a flex `gap`,
 *  so the distance across the seam is identical to the distance between any
 *  two neighbours at every breakpoint.
 *
 *  Speed is px/second, so both rows drift at a matched pace no matter how
 *  many prints they hold. */
function GalleryTrack({
  photos,
  direction,
  speed,
}: {
  photos: typeof shotOn.photos;
  direction: "left" | "right";
  /** pixels per second */
  speed: number;
}) {
  // Repeat the base strip so a single half comfortably overflows even ultrawide
  // screens, then duplicate that half for the seamless loop.
  const strip = [...photos, ...photos];

  const trackRef = useRef<HTMLDivElement>(null);
  const halfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const half = halfRef.current;
    if (!track || !half) return;
    // Reduced motion: no ambient drift, but dragging still works - the rows
    // are the only way to reach the prints hidden past the viewport edge.
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let halfWidth = half.offsetWidth;
    let offset = 0; // 0..halfWidth, distance travelled within one wrap
    let rate = reducedMotion ? 0 : 1; // current speed multiplier
    let target = reducedMotion ? 0 : 1; // 1 = drifting, 0 = eased to a halt on hover
    let last = 0;
    let frame = 0;
    let visible = true;
    let dragging = false;
    let velocity = 0; // px/s carried over from a drag fling, decays to 0

    // Velocity can run backwards, so wrap into [0, halfWidth) from either side.
    const wrap = (v: number) => ((v % halfWidth) + halfWidth) % halfWidth;

    const draw = () => {
      // `direction` only decides which way the wrapped offset is applied; the
      // maths stays identical, so both rows share the same wrap guarantees.
      const x = direction === "left" ? -offset : offset - halfWidth;
      track.style.transform = `translate3d(${x}px, 0, 0)`;
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      // Clamp dt so a backgrounded tab, a long task or a paint stall resumes
      // from where it left off instead of teleporting a full second forward.
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      // Frame-rate independent ease toward the target speed (~0.25s to settle),
      // so hovering glides to a stop on 60Hz and 120Hz alike.
      rate += (target - rate) * (1 - Math.exp(-dt / 0.09));

      if (halfWidth > 0) {
        offset = wrap(offset + (speed * rate + velocity) * dt);
        // Exponential decay lets a fling glide back into the ambient drift.
        velocity *= Math.exp(-dt / 0.6);
        if (Math.abs(velocity) < 2) velocity = 0;
        draw();
      }
      if (rate < 0.001 && target === 0 && velocity === 0) {
        // Fully stopped: stop burning frames until the pointer leaves.
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const start = () => {
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    // Re-measure when images finish loading or the viewport changes. Keep the
    // offset inside the new half so the track never snaps.
    const ro = new ResizeObserver(() => {
      halfWidth = half.offsetWidth;
      if (halfWidth > 0) offset %= halfWidth;
      draw();
    });
    ro.observe(half);

    // Only animate while the row is on screen. Backgrounded tabs need no
    // special casing: the browser already stops firing rAF, and the dt clamp
    // absorbs the timestamp jump on the way back.
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[entries.length - 1]?.isIntersecting ?? false;
        if (visible) start();
        else stop();
      },
      { rootMargin: "200px" },
    );
    io.observe(track);

    // Bubbling pointerover/pointerout (not enter/leave) so the handlers still
    // fire while the pointer is over a child print; `relatedTarget` filters out
    // the crossings between prints inside the track. Mouse only - the
    // compatibility events a tap synthesises would otherwise freeze the row
    // with no mouseout to ever unfreeze it.
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target = 0;
    };
    const onOut = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || reducedMotion) return;
      if (track.contains(e.relatedTarget as Node | null)) return;
      target = 1;
      if (visible) start();
    };
    track.addEventListener("pointerover", onOver);
    track.addEventListener("pointerout", onOut);

    // Drag to browse - pointer events cover mouse and touch alike. While the
    // pointer is down the wrapped offset follows it 1:1; on release the fling
    // velocity (an EMA, so a pause before letting go means no fling) is handed
    // to the tick loop and decays back into the ambient drift. `touch-pan-y`
    // on the track leaves vertical page scrolling to the browser, which
    // reports it as a pointercancel.
    let dragLastX = 0;
    let dragLastT = 0;
    let flingVel = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      dragLastX = e.clientX;
      dragLastT = e.timeStamp;
      velocity = 0;
      flingVel = 0;
      try {
        track.setPointerCapture(e.pointerId);
      } catch {
        // Pointer already gone (or synthetic) - the drag still works, the
        // capture is only there to keep fast drags from escaping the track.
      }
      if (visible) start();
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging || halfWidth === 0) return;
      const dx = e.clientX - dragLastX;
      const dtMove = (e.timeStamp - dragLastT) / 1000;
      dragLastX = e.clientX;
      dragLastT = e.timeStamp;
      // Screen-space dx maps onto the offset with the row's own direction, so
      // the prints always follow the pointer.
      const delta = direction === "left" ? -dx : dx;
      offset = wrap(offset + delta);
      draw();
      if (dtMove > 0) flingVel = flingVel * 0.8 + (delta / dtMove) * 0.2;
    };
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      velocity = flingVel;
      flingVel = 0;
      if (visible) start();
    };
    track.addEventListener("pointerdown", onPointerDown);
    track.addEventListener("pointermove", onPointerMove);
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);

    draw();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      track.removeEventListener("pointerover", onOver);
      track.removeEventListener("pointerout", onOut);
      track.removeEventListener("pointerdown", onPointerDown);
      track.removeEventListener("pointermove", onPointerMove);
      track.removeEventListener("pointerup", endDrag);
      track.removeEventListener("pointercancel", endDrag);
    };
  }, [direction, speed]);

  const items = strip.map((photo, i) => (
    <div key={i} className="shrink-0 px-3 md:px-4">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <Image
          src={photo.src}
          alt={photo.alt}
          width={480}
          height={320}
          sizes="(min-width: 768px) 420px, (min-width: 640px) 330px, 240px"
          draggable={false}
          className="block h-[160px] w-auto object-contain sm:h-[220px] md:h-[280px]"
        />
      </div>
    </div>
  ));

  return (
    <div
      ref={trackRef}
      className="flex w-max cursor-grab touch-pan-y select-none items-center will-change-transform active:cursor-grabbing"
    >
      <div ref={halfRef} className="flex shrink-0 items-center">
        {items}
      </div>
      <div aria-hidden className="flex shrink-0 items-center">
        {items}
      </div>
    </div>
  );
}

export function ShotOn() {
  // Split the roll across the two rows rather than repeating the whole set in
  // each - with 26 prints, reusing every photo per track quadruples the DOM
  // for no visual gain.
  const mid = Math.ceil(shotOn.photos.length / 2);
  const topRow = shotOn.photos.slice(0, mid);
  const bottomRow = shotOn.photos.slice(mid);

  return (
    <section
      id="photos"
      aria-label="Shot on VHSMO"
      className="relative overflow-hidden bg-darkroom-deep  text-halide pb-12 sm:pb-12"
    >
      <Marquee text={`shot on VHSMO · ${shotOn.marquee}`} variant="kodak" />

      {/* Running head - matches the eyebrow pattern used across the site */}
      <div className="shell relative mb-14 mt-16 text-center">
   

        <Reveal delay={0.05}>
          <h2 className="display mx-auto mt-12 max-w-4xl text-[clamp(2.2rem,4.5vw,4.25rem)] leading-[0.95] text-overexpose">
            Real moments.{" "}
            <span className="relative inline-block text-kodak">
              No filters.
              <Scribble className="absolute -bottom-1 left-0 h-2.5 w-full" />
            </span>
          </h2>
        </Reveal>
      </div>

      {/* Auto-scrolling gallery - two rows drifting in opposite directions */}
      <div className="relative flex flex-col gap-6 md:gap-8">
        <GalleryTrack photos={topRow} direction="left" speed={60} />
        <GalleryTrack
          photos={[...bottomRow].reverse()}
          direction="right"
          speed={52}
        />

        {/* Soft edge fades so prints dissolve into the dark instead of clipping */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-darkroom-deep to-transparent sm:w-32"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-darkroom-deep to-transparent sm:w-32"
        />
      </div>
    </section>
  );
}
