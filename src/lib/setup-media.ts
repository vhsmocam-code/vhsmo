import fs from "node:fs";
import path from "node:path";
import type { MediaSlotConfig } from "@/lib/setup";

/**
 * Resolves a media slot to whatever real file exists under public/setup/.
 * Runs on the server (build / request time), so dropping a file at the
 * conventional path swaps the placeholder out with no code change.
 */

const ROOT = path.join(process.cwd(), "public", "setup");
const VIDEO_EXT = ["mp4", "webm"];
const IMAGE_EXT = ["gif", "webp", "jpg", "jpeg", "png"];

export type ResolvedMedia =
  | { kind: "video"; sources: { src: string; type: string }[]; poster?: string }
  | { kind: "image"; src: string; unoptimized: boolean }
  | { kind: "placeholder" };

function find(slot: string, exts: string[]): string[] {
  return exts
    .filter((ext) => fs.existsSync(path.join(ROOT, `${slot}.${ext}`)))
    .map((ext) => `/setup/${slot}.${ext}`);
}

/** First existing poster for a video slot, e.g. media-poster.jpg. */
export function resolvePoster(posterSlot: string): string | undefined {
  return find(posterSlot, ["webp", "jpg", "jpeg", "png"])[0];
}

export function resolveMedia(
  config: Pick<MediaSlotConfig, "slot" | "fallback">,
  posterSlot?: string,
): ResolvedMedia {
  const videos = find(config.slot, VIDEO_EXT);
  if (videos.length) {
    return {
      kind: "video",
      sources: videos.map((src) => ({
        src,
        type: src.endsWith(".webm") ? "video/webm" : "video/mp4",
      })),
      poster: resolvePoster(posterSlot ?? `${config.slot}-poster`),
    };
  }
  const image = find(config.slot, IMAGE_EXT)[0];
  if (image) return { kind: "image", src: image, unoptimized: image.endsWith(".gif") };
  if (config.fallback) return { kind: "image", src: config.fallback, unoptimized: false };
  return { kind: "placeholder" };
}
