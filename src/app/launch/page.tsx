"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Loader2, Mail, XCircle } from "lucide-react";
import { Marquee } from "@/components/brand/Marquee";
import { Sticker, StarburstSeal } from "@/components/brand/Sticker";
import { TapedPhoto } from "@/components/brand/TapedPhoto";
import { Scribble } from "@/components/brand/Scribble";
import { MagneticButton } from "@/components/brand/MagneticButton";
import { seededRotation } from "@/lib/random";
import { TAGLINE, LAUNCH_BANNER } from "@/lib/landing";

// VHSMO goes live - July 25, 6:00 PM IST.
const LAUNCH_DATE = new Date("2026-07-25T18:00:00+05:30");

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
};

function getRemaining(): Remaining {
  const diff = LAUNCH_DATE.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: false,
  };
}

type VerifyStatus = "idle" | "checking" | "verified" | "notfound" | "error";

/**
 * The drop poster. Same magazine-scan language as the landing page -
 * taped prints, slapped stickers, running marquee bands - compressed
 * into a single countdown spread.
 */
export default function LaunchPage() {
  // Countdown - computed on the client only to avoid hydration mismatch.
  const [time, setTime] = useState<Remaining | null>(null);

  useEffect(() => {
    setTime(getRemaining());
    const id = setInterval(() => setTime(getRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

  // Waitlist verification.
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const isFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function onVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isFormatValid || status === "checking") return;
    setStatus("checking");
    try {
      const res = await fetch("/api/waitlist/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setStatus(data.exists ? "verified" : "notfound");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-darkroom text-halide">
      {/* The scene - night-out photograph sunk into the darkroom */}
      <div aria-hidden className="absolute inset-0">
        <Image
          src="/heroLatest.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%]"
        />
        {/* Brown wash + a light blur to soften the collage behind the type - matches the hero */}
        <div className="pointer-events-none absolute inset-0 bg-[#5A4332]/30 mix-blend-multiply backdrop-blur-[2px]" />
        {/* Darkroom gradient for type legibility - matches the hero */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-darkroom/85 via-darkroom/10 to-darkroom/65" />
      </div>

      {/* Running head - the "now rolling" band, teased for the drop */}
      <div className="relative z-10">
        <Marquee text={LAUNCH_BANNER} duration={24} />
      </div>

  

   

      {/* ---------- The poster ---------- */}
      <main className="container-px relative z-10 flex flex-1 flex-col items-center justify-center py-16 text-center sm:py-5">
        <div className="mt-5">
          <Sticker rotate={seededRotation(3, 4)} size="md">
            Launching soon
          </Sticker>
        </div>

        {/* Wordmark - sprayed on, one letter at a time */}
        <h1
          aria-label="VHSMO"
          className="relative mt-2 select-none whitespace-nowrap"
        >
          <Link href="/" aria-label="VHSMO home" className="block">
            <Image
              src="/yellowLogo.png"
              alt="VHSMO"
              width={2311}
              height={679}
              priority
              className="mx-auto w-[min(90vw,42rem)] drop-shadow-[0.4rem_0.6rem_0_rgba(31,26,24,0.4)]"
            />
          </Link>
        </h1>

        <div>
          <p className="mx-auto mt-7 max-w-md text-balance text-lg font-medium leading-snug text-overexpose sm:text-xl">
            The camera with the soul of the 2000s drops{" "}
            <span className="font-marker inline-block -rotate-1 bg-kodak px-2 text-darkroom">
              July 25 · 6:00 PM IST
            </span>
          </p>
          <p className="eyebrow mt-4 text-kodak">{TAGLINE.join(" ")}</p>
        </div>

        {/* Countdown - four prints taped to the page, or the live sticker */}
        {time?.done ? (
          <div className="mt-12 flex flex-col items-center gap-8">
            <Sticker size="lg" rotate={seededRotation(11, 4)}>
              We&apos;re live.
            </Sticker>
            <MagneticButton href="/#reserve">
              Reserve yours
              <span aria-hidden>→</span>
            </MagneticButton>
          </div>
        ) : (
          <div className="mt-12 flex items-center justify-center gap-1 sm:gap-3">
            <TimePrint label="days" value={time?.days} seed={41} />
            <Colon />
            <TimePrint label="hours" value={time?.hours} seed={42} />
            <Colon />
            <TimePrint label="mins" value={time?.minutes} seed={43} />
            <Colon />
            <TimePrint label="secs" value={time?.seconds} seed={44} />
          </div>
        )}

        {/* ---------- Waitlist ---------- */}
        <div className="mt-14 w-full max-w-md sm:mt-16">
          <Sticker variant="bluehour" rotate={seededRotation(17, 3)}>
            Are you on the list?
          </Sticker>

          <p className="mt-5 text-sm leading-relaxed text-halide/75">
            Check if your email made the waitlist for{" "}
            <span className="font-bold text-kodak">early access.</span>
          </p>

          <form onSubmit={onVerify} className="mt-5">
            <div
              className={
                "flex items-center gap-3 border-2 bg-darkroom/70 px-4 py-3.5 backdrop-blur-sm transition-colors " +
                (status === "verified"
                  ? "border-green-500"
                  : status === "notfound" || status === "error"
                    ? "border-red-400/70"
                    : "border-halide/25 focus-within:border-kodak/70")
              }
            >
              <Mail className="size-4 shrink-0 text-halide/50" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== "idle") setStatus("idle");
                }}
                placeholder="you@gmail.com"
                autoComplete="email"
                inputMode="email"
                className="min-w-0 flex-1 bg-transparent text-base md:text-sm text-overexpose placeholder:text-halide/35 focus:outline-none"
              />
              {status === "checking" && (
                <Loader2 className="size-4 shrink-0 animate-spin text-halide/50" />
              )}
              {status === "verified" && (
                <CheckCircle2 className="status-pop size-4 shrink-0 text-green-500" />
              )}
              {/* {(status === "notfound" || status === "error") && (
                <XCircle className="status-pop size-4 shrink-0 text-red-400" />
              )} */}
            </div>

            <button
              type="submit"
              disabled={!isFormatValid || status === "checking"}
              className="font-marker edge-torn mt-5 w-full bg-kodak px-8 py-4 text-lg uppercase tracking-wide text-darkroom shadow-[0.25rem_0.4rem_0_rgba(31,26,24,0.45)] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0.1rem_0.15rem_0_rgba(31,26,24,0.45)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              Verify my spot
            </button>
          </form>

          {/* Result - scribbled into the margin */}
          <div className="mt-5 min-h-[1.75rem]">
            {status === "verified" && (
              <p className="status-rise font-marker inline-block -rotate-1 bg-green-600 px-3 py-1 text-sm text-white">
                You&apos;re on the list - early access is yours.
              </p>
            )}
            {status === "notfound" && (
              <p className="status-rise font-marker inline-block rotate-1 rounded-md bg-red-500/15 px-3 py-1 text-sm text-red-400">
                This email isn&apos;t on the waitlist.
              </p>
            )}
            {status === "error" && (
              <p className="status-rise font-marker inline-block rounded-md bg-red-500/15 px-3 py-1 text-sm text-red-400">
                Something went wrong - try again.
              </p>
            )}
            {(status === "idle" || status === "checking") && (
              <span className="relative inline-block">
                <span className="font-marker text-sm text-halide/60">
                  don&apos;t miss the drop!
                </span>
                <Scribble className="absolute -bottom-1.5 left-0 h-2 w-full opacity-70" />
              </span>
            )}
          </div>
        </div>

        {/* The pitch, in three slapped labels */}
      
      </main>

      {/* Closing band */}
      <div className="relative z-10">
        <Marquee
          text={LAUNCH_BANNER}
          duration={32}
          reverse
          variant="darkroom"
        />
      </div>
    </div>
  );
}

/* ---------------- pieces ---------------- */

/**
 * One countdown cell as a taped-in print: white photo border, dark
 * exposure with the number burned in, label written in the margin.
 */
function TimePrint({
  label,
  value,
  seed,
}: {
  label: string;
  value?: number;
  seed: number;
}) {
  return (
    <div
      className="relative w-[4.6rem] bg-overexpose p-1.5 pb-0.5 shadow-[0.3rem_0.5rem_1rem_rgba(31,26,24,0.5)] sm:w-24 sm:p-2 sm:pb-1"
      style={{ rotate: `${seededRotation(seed, 3)}deg` }}
    >
      <span
        aria-hidden
        className="tape -top-2.5 left-1/2 h-5 w-12 -translate-x-1/2 sm:w-14"
        style={{ rotate: `${seededRotation(seed + 5, 6)}deg` }}
      />
      <div className="flex items-center justify-center bg-darkroom-deep py-2.5 sm:py-4">
        <span className="font-marker text-[2rem] leading-none tabular-nums text-kodak sm:text-5xl">
          {value === undefined ? "--" : String(value).padStart(2, "0")}
        </span>
      </div>
      <p className="font-marker py-1 text-center text-[0.65rem] leading-none text-darkroom sm:text-xs">
        {label}
      </p>
    </div>
  );
}

function Colon() {
  return (
    <span
      aria-hidden
      className="font-marker -mt-4 text-2xl text-kodak/60 sm:text-3xl"
    >
      :
    </span>
  );
}
