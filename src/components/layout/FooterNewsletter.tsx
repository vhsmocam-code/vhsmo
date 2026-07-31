"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

type Status = "idle" | "sending" | "done" | "error";

/** "Stay in the loop" - footer signup that drops the email on the waitlist. */
export function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/waitlist/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setStatus(res.ok && data.success ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="font-marker w-fit -rotate-1 bg-kodak px-3 py-2 text-lg leading-tight text-darkroom shadow-[0.15rem_0.3rem_0.5rem_rgba(31,26,24,0.18)]">
        you&apos;re in the loop now!
      </p>
    );
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex items-stretch gap-2.5">
        <input
          type="email"
          name="newsletter-email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="Enter your email"
          autoComplete="email"
          inputMode="email"
          aria-label="Email for updates"
          className="w-full min-w-0 rounded-xl border-2 border-darkroom/15 bg-overexpose px-4 py-3 text-base md:text-sm text-darkroom outline-none transition-colors placeholder:text-darkroom/35 hover:border-darkroom/30 focus:border-darkroom"
        />
        <button
          type="submit"
          aria-label="Subscribe"
          disabled={status === "sending"}
          className="flex w-12 shrink-0 items-center justify-center rounded-xl bg-darkroom text-halide transition-all hover:bg-darkroom-deep hover:text-kodak active:scale-95 disabled:opacity-60"
        >
          {status === "sending" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowRight className="size-4" />
          )}
        </button>
      </form>
      {status === "error" && (
        <p className="status-rise mt-2 text-xs font-semibold text-red-500">
          That didn&apos;t work - check the email and try again.
        </p>
      )}
    </div>
  );
}
