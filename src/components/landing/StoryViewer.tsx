"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Volume2, VolumeX, X } from "lucide-react";
import type { Story } from "@/lib/landing";
import { productHrefForColor } from "@/lib/products";
import { useDefaultProduct, useProducts } from "@/lib/products-context";
import { formatCurrency } from "@/lib/utils";

/** `sizes` for the full-size story image. The viewer and the preloader must
 *  share it so a warmed image is the exact URL the viewer then asks for. */
export const VIEWER_SIZES = "(min-width: 640px) 420px, 100vw";

/**
 * Fetches stories' viewer-size images into the browser cache ahead of time
 * (hidden, eager, low priority) so opening or swiping never shows an empty
 * frame. Renders nothing visible; videos are skipped.
 */
export function StoryPreload({ stories }: { stories: Story[] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute size-px overflow-hidden opacity-0">
      {stories.map(
        (s) =>
          s.type === "photo" && (
            <Image key={s.src} src={s.src} alt="" fill sizes={VIEWER_SIZES} loading="eager" fetchPriority="low" />
          ),
      )}
    </div>
  );
}

/** How long a photo stays up before the reel moves on. */
const PHOTO_MS = 5000;
/** A press shorter than this is a tap (navigate); longer is a hold (pause). */
const TAP_MS = 220;
/** Drag this far down to dismiss, like closing a story. */
const DISMISS_PX = 90;
/** Movement before a press is read as a swipe/drag rather than a tap. */
const AXIS_PX = 10;
/** Horizontal distance (or speed, px/ms) that counts as a swipe. */
const SWIPE_PX = 50;
const SWIPE_SPEED = 0.4;

type StoryViewerProps = {
  stories: Story[];
  /** The open story, or null when the viewer is closed. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

/**
 * Full-screen, Instagram-style story player for the unboxing reel.
 *
 * Radix owns the dialog semantics (focus trap, Esc, scroll lock, focus return
 * to the card that opened it). Progress is a single 0→1 value driven by rAF so
 * a hold can pause mid-segment and resume from the same spot. Under reduced
 * motion nothing advances on its own; taps and arrow keys still navigate.
 */
export function StoryViewer({ stories, index, onIndexChange, onClose }: StoryViewerProps) {
  const reduceMotion = useReducedMotion();
  const products = useProducts();
  const fallbackProduct = useDefaultProduct();
  const open = index !== null;
  const story = index !== null ? stories[index] : undefined;
  // The CTA sells the finish in the story on screen, at that finish's price.
  const product =
    (story && products.find((p) => p.color === story.finish)) || fallbackProduct;
  const ctaHref = productHrefForColor(products, story?.finish ?? "");

  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const next = useCallback(() => {
    if (index === null) return;
    if (index >= stories.length - 1) onClose();
    else onIndexChange(index + 1);
  }, [index, stories.length, onClose, onIndexChange]);

  const prev = useCallback(() => {
    if (index === null) return;
    onIndexChange(Math.max(0, index - 1));
  }, [index, onIndexChange]);

  // Each story starts from an empty segment.
  useEffect(() => {
    setProgress(0);
    setPaused(false);
  }, [index]);

  // Photo timer. Videos report their own progress from timeupdate instead.
  useEffect(() => {
    if (!open || !story || story.type !== "photo" || paused || reduceMotion) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      setProgress((p) => Math.min(1, p + dt / PHOTO_MS));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, story, paused, reduceMotion]);

  // Advance once per full segment. `next` is read through a ref so a new
  // index (which recreates `next`) can't re-fire this while progress is still
  // 1 from the story that just ended - that skipped a story.
  const nextRef = useRef(next);
  nextRef.current = next;
  useEffect(() => {
    if (progress >= 1) nextRef.current();
  }, [progress]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (paused) v.pause();
    else void v.play().catch(() => {});
  }, [paused]);

  // Sound for video stories. Videos always start muted (the only way browsers
  // allow autoplay); tapping the speaker unmutes the playing clip, and the
  // choice sticks for the rest of the session and for later videos. Set on the
  // element directly - React doesn't keep a <video muted> prop in sync.
  const [soundOn, setSoundOn] = useState(false);
  useEffect(() => {
    try {
      if (sessionStorage.getItem("vhsmo:story-sound") === "1") setSoundOn(true);
    } catch {
      /* storage unavailable - sound just starts off */
    }
  }, []);
  useEffect(() => {
    const v = videoRef.current;
    if (v) v.muted = !soundOn;
  }, [soundOn, index]);
  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    try {
      sessionStorage.setItem("vhsmo:story-sound", next ? "1" : "0");
    } catch {
      /* ignore */
    }
    // Inside the tap, so the browser lets sound start.
    const v = videoRef.current;
    if (v) {
      v.muted = !next;
      if (next && v.paused && !paused) void v.play().catch(() => {});
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, next, prev]);

  // Pointer gestures on the media: tap halves to navigate, hold to pause,
  // drag down to dismiss.
  // axis is decided once per gesture, a few px in: "x" = swipe between stories,
  // "y" = drag down to dismiss, null = still a tap / hold.
  const press = useRef<{ t: number; x: number; y: number; axis: "x" | "y" | null } | null>(null);
  const [dragY, setDragY] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  function resetDrag() {
    setDragX(0);
    setDragY(0);
    setDragging(false);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // Keep receiving moves if a mouse drag leaves the frame.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* not an active pointer (e.g. synthetic) - capture is only a nicety */
    }
    press.current = { t: performance.now(), x: e.clientX, y: e.clientY, axis: null };
    setPaused(true);
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const p = press.current;
    if (!p) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    if (!p.axis && Math.max(Math.abs(dx), Math.abs(dy)) > AXIS_PX) {
      p.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      setDragging(true);
    }
    if (p.axis === "x") setDragX(dx);
    else if (p.axis === "y") setDragY(Math.max(0, dy));
  }
  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const p = press.current;
    press.current = null;
    setPaused(false);
    resetDrag();
    if (!p || index === null) return;

    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    const ms = Math.max(1, performance.now() - p.t);

    if (p.axis === "y") {
      if (dy > DISMISS_PX) onClose();
      return;
    }
    if (p.axis === "x") {
      // A real swipe: far enough, or quick and decisive. At either end of the
      // reel it just springs back - it never closes the viewer.
      const swiped = Math.abs(dx) >= SWIPE_PX || (Math.abs(dx) > 25 && Math.abs(dx) / ms > SWIPE_SPEED);
      if (!swiped) return;
      if (dx < 0 && index < stories.length - 1) next();
      else if (dx > 0 && index > 0) prev();
      return;
    }
    if (ms > TAP_MS) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX - rect.left < rect.width * 0.33) prev();
    else next();
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-darkroom-deep/95" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-[91] flex flex-col items-center justify-center outline-none"
        >
          {story && index !== null && (
            <>
              {/* IG-style ambient backdrop: the same frame, blurred and dimmed */}
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                  key={`bg-${story.src}`}
                  className="absolute inset-0 scale-125 bg-cover bg-center opacity-40 blur-3xl"
                  style={story.blur ? { backgroundImage: `url("${story.blur}")` } : undefined}
                />
              </div>

              <StoryPreload
                stories={[stories[index + 1], stories[index + 2], stories[index - 1]].filter(
                  (x): x is Story => !!x,
                )}
              />

              <Dialog.Title className="sr-only">
                {story.handle ? `Unboxing story from @${story.handle}` : "Unboxing story"}
              </Dialog.Title>

              <div className="relative flex h-full w-full max-w-[min(100vw,calc((100dvh-10rem)*9/16))] flex-col sm:h-auto sm:py-6">
                <StoryHeader
                  stories={stories}
                  index={index}
                  progress={progress}
                  story={story}
                />
                <motion.div
                  animate={{
                    x: reduceMotion ? 0 : dragX * 0.6,
                    y: dragY,
                    opacity: 1 - Math.min(dragY / 400, 0.5) - Math.min(Math.abs(dragX) / 600, 0.25),
                  }}
                  transition={dragging ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                  className="relative flex min-h-0 flex-1 touch-none select-none flex-col overflow-hidden bg-darkroom-deep sm:aspect-[9/16] sm:flex-none sm:rounded-[1.5rem] sm:ring-1 sm:ring-halide/15"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={() => {
                    press.current = null;
                    setPaused(false);
                                    resetDrag();
                  }}
                >
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.div
                      key={story.src}
                      initial={reduceMotion ? false : { opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reduceMotion ? undefined : { opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="relative flex min-h-0 flex-1 flex-col"
                    >
                      <StoryMedia
                        story={story}
                        videoRef={videoRef}
                        onVideoProgress={setProgress}
                        onVideoEnd={next}
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>
                </motion.div>

                {/* Persistent conversion bar */}
                <div className="relative z-10 flex items-center justify-between gap-3 px-4 py-4 sm:px-0 sm:pb-0">
                  <div className="min-w-0">
                    <p className="font-marker text-sm leading-tight text-kodak sm:text-base">
                      Want this in your hands?
                    </p>
                  </div>
                  <Link
                    href={ctaHref}
                    onClick={onClose}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-kodak px-5 py-3 text-sm font-bold text-darkroom transition-shadow hover:shadow-[0_0_0_5px_rgba(253,241,0,0.25)] sm:text-base"
                  >
                    Get yours{product ? ` — ${formatCurrency(product.price)}` : ""}
                  </Link>
                </div>
              </div>

              {story.type === "video" && (
                <button
                  type="button"
                  onClick={toggleSound}
                  aria-label={soundOn ? "Mute sound" : "Turn sound on"}
                  aria-pressed={soundOn}
                  className="absolute right-[4rem] top-[0.95rem] z-20 grid size-11 place-items-center rounded-full bg-darkroom-deep/60 text-overexpose transition-colors hover:bg-darkroom-deep sm:right-[4.75rem] sm:top-6"
                >
                  {soundOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
                </button>
              )}

              <Dialog.Close
                aria-label="Close story"
                className="absolute right-3 top-[0.95rem] z-20 grid size-11 place-items-center rounded-full bg-darkroom-deep/60 text-overexpose transition-colors hover:bg-darkroom-deep sm:right-6 sm:top-6"
              >
                <X className="size-5" />
              </Dialog.Close>

              {/* Desktop arrows beside the frame */}
              <button
                type="button"
                onClick={prev}
                disabled={index === 0}
                aria-label="Previous story"
                className="absolute left-6 top-1/2 z-20 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-halide/10 text-2xl text-overexpose transition-colors hover:bg-halide/20 disabled:opacity-30 md:grid"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={next}
                aria-label={index === stories.length - 1 ? "Close stories" : "Next story"}
                className="absolute right-6 top-1/2 z-20 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-halide/10 text-2xl text-overexpose transition-colors hover:bg-halide/20 md:grid"
              >
                ›
              </button>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * The story's media, shared by the reel card and the viewer. Photos fill the
 * frame; a DM story (one with a quote) stacks the photo over the message text.
 */
export function StoryMedia({
  story,
  videoRef,
  onVideoProgress,
  onVideoEnd,
  priority,
  eager,
  sizes = VIEWER_SIZES,
  quoteClamp,
}: {
  story: Story;
  videoRef?: React.Ref<HTMLVideoElement>;
  onVideoProgress?: (p: number) => void;
  onVideoEnd?: () => void;
  priority?: boolean;
  /** Load now rather than when scrolled near (reel cards once the section is close). */
  eager?: boolean;
  sizes?: string;
  /** Truncate the DM text (reel cards); the viewer shows it whole. */
  quoteClamp?: boolean;
}) {
  const media =
    story.type === "video" ? (
      <video
        ref={videoRef}
        src={story.src}
        poster={story.poster}
        muted
        playsInline
        // Cards only show the poster; the viewer fetches and plays the clip.
        preload={onVideoEnd ? "auto" : "none"}
        autoPlay={!!onVideoEnd}
        loop={!onVideoEnd}
        aria-label={`${story.handle ? `@${story.handle}'s` : "A buyer's"} VHSMO in ${story.finish}, unboxing video`}
        // Capped just under 1 so reaching the end never also trips the
        // "progress complete" advance on top of onEnded (that skipped a story).
        onTimeUpdate={(e) =>
          onVideoProgress?.(
            Math.min(0.999, e.currentTarget.currentTime / (e.currentTarget.duration || 1)),
          )
        }
        onEnded={onVideoEnd}
        // contain: the whole frame is always visible (a phone viewer frame is a
        // touch taller than 9:16 and cover would trim the sides).
        className="absolute inset-0 h-full w-full object-contain"
      />
    ) : (
      <Image
        src={story.src}
        alt={`${story.handle ? `@${story.handle}'s` : "A buyer's"} VHSMO in ${story.finish}, unboxed`}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority || eager ? "eager" : "lazy"}
        placeholder={story.blur ? "blur" : "empty"}
        blurDataURL={story.blur}
        draggable={false}
        className={story.quote ? "object-contain" : "object-cover"}
        style={story.focus ? { objectPosition: story.focus } : undefined}
      />
    );

  if (!story.quote) return <div className="relative min-h-0 flex-1">{media}</div>;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#1c1c1e]">
      <div className="relative mx-3 mt-3 min-h-0 flex-1 overflow-hidden rounded-2xl">{media}</div>
      <blockquote
        className={`mx-3 mb-4 mt-2 rounded-2xl bg-[#2c2c2e] px-4 py-3 text-[0.95rem] leading-snug text-overexpose ${
          quoteClamp ? "mb-12 line-clamp-3 text-sm" : ""
        }`}
      >
        {story.quote}
      </blockquote>
    </div>
  );
}

/**
 * Progress segments + who posted it, as their own strip above the frame (not
 * over the photo). On phones the mute / close buttons sit in the right of the
 * name row - the h-11 row reserves their space.
 */
function StoryHeader({
  stories,
  index,
  progress,
  story,
}: {
  stories: Story[];
  index: number;
  progress: number;
  story: Story;
}) {
  return (
    <div className="px-4 pt-3 sm:px-0 sm:pt-0">
      <div className="flex gap-1" aria-hidden>
        {stories.map((s, i) => (
          <span key={s.src} className="h-[3px] flex-1 overflow-hidden rounded-full bg-halide/25">
            <span
              className="block h-full bg-overexpose"
              style={{ width: `${i < index ? 100 : i > index ? 0 : Math.round(progress * 1000) / 10}%` }}
            />
          </span>
        ))}
      </div>
      <p className="flex h-11 items-center truncate pr-24 text-sm font-semibold text-overexpose sm:pr-0">
        {story.handle ? `@${story.handle}` : "A VHSMO buyer"}
        <span className="ml-1.5 font-normal text-overexpose/60">· {story.finish}</span>
      </p>
    </div>
  );
}
