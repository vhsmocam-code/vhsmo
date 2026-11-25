"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Volume2, VolumeX, X } from "lucide-react";
import {
  isStoryMusicMuted,
  pauseStoryMusic,
  resumeStoryMusic,
  setStoryMusicMuted,
  stopStoryMusic,
} from "@/lib/story-music";
import type { Story } from "@/lib/landing";
import { RESERVE_HREF } from "@/lib/landing";
import { useDefaultProduct } from "@/lib/products-context";
import { formatCurrency } from "@/lib/utils";

/** How long a photo stays up before the reel moves on. */
const PHOTO_MS = 5000;
/** A press shorter than this is a tap (navigate); longer is a hold (pause). */
const TAP_MS = 220;
/** Drag this far down to dismiss, like closing a story. */
const DISMISS_PX = 90;

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
  const product = useDefaultProduct();
  const open = index !== null;
  const story = index !== null ? stories[index] : undefined;

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

  // Soundtrack: it starts from the tap on the card (Reviews.tsx); here it
  // follows the viewer - fades out when it closes, and freezes while the tab
  // is hidden so it never plays to nobody.
  useEffect(() => {
    if (!open) {
      stopStoryMusic();
      return;
    }
    const onVisibility = () => {
      if (document.hidden) pauseStoryMusic();
      else if (!musicHeld.current) resumeStoryMusic();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [open]);

  const [muted, setMuted] = useState(isStoryMusicMuted);
  function toggleMuted() {
    setStoryMusicMuted(!muted);
    setMuted(!muted);
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
  const press = useRef<{ t: number; x: number; y: number } | null>(null);
  const [dragY, setDragY] = useState(0);

  // The music only freezes on a real hold (same threshold as a tap), so quick
  // taps between stories don't make it stutter.
  const holdTimer = useRef(0);
  const musicHeld = useRef(false);
  function releaseMusic() {
    window.clearTimeout(holdTimer.current);
    if (musicHeld.current) {
      musicHeld.current = false;
      resumeStoryMusic();
    }
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    press.current = { t: performance.now(), x: e.clientX, y: e.clientY };
    setPaused(true);
    holdTimer.current = window.setTimeout(() => {
      musicHeld.current = true;
      pauseStoryMusic();
    }, TAP_MS);
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!press.current) return;
    setDragY(Math.max(0, e.clientY - press.current.y));
  }
  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const p = press.current;
    press.current = null;
    setPaused(false);
    releaseMusic();
    const dy = e.clientY - (p?.y ?? e.clientY);
    setDragY(0);
    if (!p) return;
    if (dy > DISMISS_PX) return onClose();
    if (performance.now() - p.t > TAP_MS || Math.abs(e.clientX - p.x) > 12) return;
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
                <Image
                  key={`bg-${story.src}`}
                  src={story.src}
                  alt=""
                  fill
                  sizes="40vw"
                  className="scale-110 object-cover opacity-35 blur-3xl"
                />
              </div>

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
                  style={{ y: dragY, opacity: 1 - Math.min(dragY / 400, 0.5) }}
                  className="relative flex min-h-0 flex-1 touch-none select-none flex-col overflow-hidden bg-darkroom-deep sm:aspect-[9/16] sm:flex-none sm:rounded-[1.5rem] sm:ring-1 sm:ring-halide/15"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={() => {
                    press.current = null;
                    setPaused(false);
                    releaseMusic();
                    setDragY(0);
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
                    href={RESERVE_HREF}
                    onClick={onClose}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-kodak px-5 py-3 text-sm font-bold text-darkroom transition-shadow hover:shadow-[0_0_0_5px_rgba(253,241,0,0.25)] sm:text-base"
                  >
                    Get yours{product ? ` — ${formatCurrency(product.price)}` : ""}
                  </Link>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleMuted}
                aria-label={muted ? "Turn music on" : "Mute music"}
                aria-pressed={muted}
                className="absolute right-[4rem] top-[0.95rem] z-20 grid size-11 place-items-center rounded-full bg-darkroom-deep/60 text-overexpose transition-colors hover:bg-darkroom-deep sm:right-[4.75rem] sm:top-6"
              >
                {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
              </button>

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
  sizes = "(min-width: 640px) 420px, 100vw",
  quoteClamp,
}: {
  story: Story;
  videoRef?: React.Ref<HTMLVideoElement>;
  onVideoProgress?: (p: number) => void;
  onVideoEnd?: () => void;
  priority?: boolean;
  sizes?: string;
  /** Truncate the DM text (reel cards); the viewer shows it whole. */
  quoteClamp?: boolean;
}) {
  const media =
    story.type === "video" ? (
      <video
        ref={videoRef}
        src={story.src}
        muted
        playsInline
        autoPlay={!!onVideoEnd}
        loop={!onVideoEnd}
        onTimeUpdate={(e) =>
          onVideoProgress?.(e.currentTarget.currentTime / (e.currentTarget.duration || 1))
        }
        onEnded={onVideoEnd}
        className="absolute inset-0 h-full w-full object-cover"
      />
    ) : (
      <Image
        src={story.src}
        alt={`${story.handle ? `@${story.handle}'s` : "A buyer's"} VHSMO in ${story.finish}, unboxed`}
        fill
        sizes={sizes}
        priority={priority}
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
