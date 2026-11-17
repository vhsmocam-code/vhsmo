"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Rotate3d } from "lucide-react";
import { useColor } from "@/lib/color-context";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/products";
import { cn } from "@/lib/utils";

/**
 * The 3D stack (three.js + the model) never touches the initial bundle or
 * the server render - it's code-split here and only fetched once the gallery
 * is within a screen of the viewport.
 */
const CameraViewer = dynamic(() => import("@/components/product/CameraViewer"), {
  ssr: false,
  loading: () => <ViewerPoster />,
});

/** Lightweight placeholder shown before the 3D chunk mounts. */
function ViewerPoster() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <p className="font-marker rotate-[-2deg] text-lg text-darkroom/40">
        loading the object…
      </p>
    </div>
  );
}

const MODEL_BACKGROUND =
  "radial-gradient(80% 65% at 50% 30%, rgba(16, 147, 255, 0.07), transparent 70%), linear-gradient(to bottom, #ffffff, #e3e3e1)";

/**
 * The product gallery: the photos and the object itself, behind one switch.
 * Photo thumbs sit in the rail; the last tile flips the same stage over to the
 * 3D model, where the feature chips swing the orbit camera to that angle.
 */
export function Gallery() {
  const { color, variant } = useColor();
  // The photos are local artwork; only which set to show comes from the row.
  const images = variant?.images ?? [DEFAULT_PRODUCT_IMAGE];
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<"photos" | "model">("photos");

  // Picking a new finish shows that body from the front again. The stage is
  // deliberately left alone: the model repaints itself now, so someone who
  // went to 3D to compare finishes gets the comparison in place instead of
  // being thrown back to the photos and having to click into 3D again.
  useEffect(() => {
    setActive(0);
  }, [color]);

  const holderRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Two observers, two jobs: `mounted` fetches the 3D chunk one screen early
  // (once, then disconnects); `inView` gates auto-rotate so the GPU is fully
  // idle whenever the gallery is scrolled away.
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);
  const [interacted, setInteracted] = useState(false);

  useEffect(() => {
    const el = holderRef.current;
    if (!el) return;
    const mountObs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setMounted(true);
          mountObs.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    const viewObs = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { threshold: 0.15 },
    );
    mountObs.observe(el);
    viewObs.observe(el);
    return () => {
      mountObs.disconnect();
      viewObs.disconnect();
    };
  }, []);

  const showModel = mode === "model";

  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-28">
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Thumbnails - photos, then the 3D tile */}
        <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col lg:overflow-visible">
          {images.map((image, i) => (
            <button
              key={image.src}
              onClick={() => {
                setActive(i);
                setMode("photos");
              }}
              aria-label={`View image ${i + 1}`}
              aria-current={!showModel && i === active}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg bg-overexpose p-1 transition-all lg:size-[72px]",
                !showModel && i === active
                  ? "ring-2 ring-kodak ring-offset-2 ring-offset-halide"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={image.src}
                alt=""
                fill
                sizes="72px"
                className="object-contain"
              />
            </button>
          ))}

          <button
            onClick={() => setMode("model")}
            aria-label="View the camera in 3D"
            aria-current={showModel}
            className={cn(
              "relative flex size-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg text-darkroom transition-all lg:size-[72px]",
              showModel
                ? "ring-2 ring-kodak ring-offset-2 ring-offset-halide"
                : "opacity-70 hover:opacity-100",
            )}
            style={{ background: MODEL_BACKGROUND }}
          >
            <Rotate3d className="size-5" strokeWidth={1.75} />
            <span className="text-[0.7rem] font-bold uppercase tracking-wide lg:text-[0.6rem]">
              3D
            </span>
          </button>
        </div>

        {/* The stage - a print in the darkroom, or the object itself */}
        <div className="relative order-1 flex-1 lg:order-2">
          <div
            className={cn(
              // Same plate as the pinned prints in the story spread: white
              // border with a deeper lip along the bottom, one soft shadow.
              "relative overflow-hidden p-2.5 pb-4 shadow-[0.25rem_0.5rem_1.1rem_rgba(31,26,24,0.22)] sm:p-3 sm:pb-5",
              showModel ? "" : "bg-overexpose",
            )}
            style={showModel ? { background: MODEL_BACKGROUND } : undefined}
          >
            {/* The aspect lives on the window, not the plate, so the border
                can be uneven without squashing the 4:3 renders */}
            <div
              ref={holderRef}
              className="relative aspect-[4/3] w-full touch-pan-y overflow-hidden"
            >
              {showModel ? (
                mounted ? (
                  <CameraViewer
                    bodyColor={variant?.body ?? "#ffc9d2"}
                    lightScale={variant?.lightScale ?? 1}
                    poster={images[0]!}
                    autoRotate={inView && !interacted && !reduceMotion}
                    onInteract={() => setInteracted(true)}
                  />
                ) : (
                  <ViewerPoster />
                )
              ) : (
                images.map((image, i) => (
                  <Image
                    key={image.src}
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className={cn(
                      // The renders are 4:3 studio shots on white - cropping
                      // them to the square stage clipped the body, so fit the
                      // whole frame instead - the white letterbox is the same
                      // white as the plate, so the bands don't read as bands
                      "object-contain",
                      // Swapping angles cross-dissolves, the incoming shot
                      // easing down from a hair oversized - enough to feel
                      // like a change, not enough to notice as an effect
                      reduceMotion
                        ? "transition-opacity duration-200"
                        : // Tailwind v4 scales via the standalone `scale`
                          // property, so `transform` here would never animate
                          "transition-[opacity,scale] duration-500 ease-[var(--ease-out-expo)]",
                      i === active
                        ? "scale-100 opacity-100"
                        : "scale-[1.04] opacity-0",
                    )}
                  />
                ))
              )}
            </div>

            {/* Badge - only the 3D stage gets one; the photos stay a clean
                print, like the ones pinned up in the story spread */}
            {showModel && (
              <span className="font-marker pointer-events-none absolute left-4 top-4 rotate-[-3deg] rounded-full bg-bluehour px-2.5 py-1 text-xs text-overexpose">
                360° · this is the real shape
              </span>
            )}

            {/* Control hint - retires after the first grab */}
            {showModel && !interacted && (
              <p className="font-marker pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rotate-[-1deg] text-sm text-darkroom/50">
                drag to spin · pinch or scroll to zoom
              </p>
            )}
          </div>

          {/* Honesty note - the swatches drive one material in a real-time
              render, so the shell reads close to the finish but not exact */}
          {showModel && (
            <p className="mt-3 text-center text-xs leading-relaxed text-darkroom/55">
              Note: this is a 3D render and made strictly for entertainment and
              interactive purposes. Actual colours and finish may vary.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
