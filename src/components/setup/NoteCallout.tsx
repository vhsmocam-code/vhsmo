import { RotateCcw, Usb, Wifi, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export type NoteIcon = "flash" | "wifi" | "usb" | "reset";

const ICONS = { flash: Zap, wifi: Wifi, usb: Usb, reset: RotateCcw } as const;

/** A highlighted note: yellow-tinted card with a round icon. */
export function NoteCallout({
  icon,
  className,
  children,
}: {
  icon: NoteIcon;
  className?: string;
  children: React.ReactNode;
}) {
  const Icon = ICONS[icon];
  return (
    <div
      className={cn(
        "flex max-w-md items-start gap-3 rounded-2xl border border-kodak/50 bg-kodak/10 p-4 text-left sm:gap-4 sm:p-5",
        className,
      )}
    >
      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-kodak text-darkroom">
        <Icon className="size-5" strokeWidth={2.5} aria-hidden />
      </span>
      <p className="text-base font-medium leading-relaxed text-halide sm:text-lg">{children}</p>
    </div>
  );
}
