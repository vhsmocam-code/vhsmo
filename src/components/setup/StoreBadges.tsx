"use client";

import { useEffect, useState } from "react";
import { ANDROID_STORE_URL, IOS_STORE_URL } from "@/lib/app-links";
import { cn } from "@/lib/utils";

type Platform = "ios" | "android" | "other";

/** Best-effort platform sniff, run after mount so SSR stays neutral. */
export function useVisitorPlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>("other");
  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isIPadOS =
      navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    if (/iPhone|iPad|iPod/i.test(ua) || isIPadOS) setPlatform("ios");
    else if (/Android/i.test(ua)) setPlatform("android");
  }, []);
  return platform;
}

function AppleLogo() {
  return (
    <svg aria-hidden viewBox="0 0 384 512" className="h-7 w-7 shrink-0 fill-current">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function PlayLogo() {
  return (
    <svg aria-hidden viewBox="0 0 512 512" className="h-6 w-6 shrink-0">
      <path fill="#2196F3" d="M99.6 32.7 325 258.1 99.6 483.5c-9.9-5.2-16.6-15.6-16.6-27.6V60.3c0-12 6.7-22.4 16.6-27.6z" />
      <path fill="#FFC107" d="m396.7 186.6 65.9 38.1c20.5 11.8 20.5 41.5 0 53.3l-65.9 38.1-71.7-58 71.7-71.5z" />
      <path fill="#4CAF50" d="M99.6 32.7c3.8-2 8.1-3.2 12.9-3.2 5.5 0 11.1 1.5 16.3 4.5l267.9 152.6-71.7 71.5L99.6 32.7z" />
      <path fill="#F44336" d="M325 258.1 396.7 316 128.8 468.6c-5.2 3-10.8 4.5-16.3 4.5-4.8 0-9.1-1.2-12.9-3.2L325 258.1z" />
    </svg>
  );
}

/**
 * Live App Store / Google Play badges. The visitor's own platform gets the
 * kodak treatment so the right button jumps out on a phone.
 */
export function StoreBadges({
  className,
  tone = "dark",
}: {
  className?: string;
  /** "dark" sits on darkroom, "light" on paper. */
  tone?: "dark" | "light";
}) {
  const platform = useVisitorPlatform();

  const badges = [
    {
      key: "ios" as const,
      href: IOS_STORE_URL,
      label: "Download VHSMO on the App Store",
      top: "Download on the",
      bottom: "App Store",
      Logo: AppleLogo,
    },
    {
      key: "android" as const,
      href: ANDROID_STORE_URL,
      label: "Get VHSMO on Google Play",
      top: "Get it on",
      bottom: "Google Play",
      Logo: PlayLogo,
    },
  ];

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {badges.map(({ key, href, label, top, bottom, Logo }) => {
        const mine = platform === key;
        return (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className={cn(
              "group relative flex min-w-[9.5rem] items-center gap-2.5 rounded-xl px-3.5 py-2.5 sm:min-w-[10.5rem] sm:px-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5",
              tone === "dark"
                ? "bg-overexpose text-darkroom ring-1 ring-overexpose/10"
                : "bg-darkroom-deep text-overexpose",
              mine && "ring-2 ring-kodak ring-offset-2 ring-offset-darkroom",
            )}
          >
            <Logo />
            <span className="leading-tight">
              <span className="block text-[0.6rem] uppercase tracking-wide opacity-70">
                {top}
              </span>
              <span className="block text-lg font-semibold">{bottom}</span>
            </span>
          </a>
        );
      })}
    </div>
  );
}
