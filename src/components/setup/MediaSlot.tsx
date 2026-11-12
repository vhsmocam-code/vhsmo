import Image from "next/image";
import { resolveMedia } from "@/lib/setup-media";
import type { MediaSlotConfig } from "@/lib/setup";
import { cn } from "@/lib/utils";
import { LoopVideo } from "./LoopVideo";
import { MediaFrame } from "./MediaFrame";

/**
 * One media area. Renders whatever real file exists at the slot's path
 * (video, GIF or image) and, until then, a clearly labelled placeholder.
 * Never draws fake product imagery.
 */
export function MediaSlot({
  config,
  sizes = "(min-width: 1024px) 55vw, 100vw",
  priority,
  bare,
  className,
}: {
  config: MediaSlotConfig;
  sizes?: string;
  priority?: boolean;
  bare?: boolean;
  className?: string;
}) {
  const media = resolveMedia(config);
  const fitClass = config.fit === "cover" ? "object-cover" : "object-contain";

  return (
    <MediaFrame ratio={config.ratio} bare={bare} className={className}>
      {media.kind === "video" && (
        <LoopVideo
          sources={media.sources}
          poster={media.poster}
          label={config.alt}
          fit={config.fit}
        />
      )}
      {media.kind === "image" && (
        <Image
          src={media.src}
          alt={config.alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={media.unoptimized}
          className={cn(fitClass, bare && "drop-shadow-[0_1.6rem_1.8rem_rgba(0,0,0,0.5)]")}
        />
      )}
      {media.kind === "placeholder" && <Placeholder config={config} />}
    </MediaFrame>
  );
}

function Placeholder({ config }: { config: MediaSlotConfig }) {
  return (
    <div
      role="img"
      aria-label={`Placeholder: ${config.brief}`}
      className="absolute inset-2 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-halide/25 bg-[repeating-linear-gradient(135deg,transparent_0_14px,rgba(227,227,225,0.04)_14px_15px)] p-4 text-center"
    >
      <span className="eyebrow text-kodak">Photo needed</span>
      <span className="text-sm text-halide/80">{config.brief}</span>
      <code className="mt-1 text-[0.7rem] text-halide/45">
        public/setup/{config.slot}.(mp4 · gif · webp · jpg)
      </code>
    </div>
  );
}
