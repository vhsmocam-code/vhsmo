import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * A plain black iPhone bezel around a real app screenshot. The captures
 * already include the status bar and Dynamic Island, so the frame is just
 * glass and shadow.
 */
export function PhoneFrame({
  src,
  alt,
  priority,
  className,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-[3rem] bg-[#0b0a09] p-[0.55rem] shadow-[0_2.2rem_3.5rem_-1rem_rgba(0,0,0,0.65)] ring-1 ring-white/10",
        className,
      )}
    >
      <div className="relative aspect-[1206/2622] overflow-hidden rounded-[2.5rem] bg-darkroom-deep">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 20rem, 72vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
