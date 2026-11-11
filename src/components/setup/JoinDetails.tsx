"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { CAMERA_WIFI } from "@/lib/setup";
import { cn } from "@/lib/utils";

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

function CopyValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onCopy = async () => {
    if (!(await copyText(value))) return;
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="flex-1">
      <p className="eyebrow text-halide/45">{label}</p>
      <div className="mt-1.5 flex items-center gap-3">
        <span className="select-all font-mono text-xl font-semibold text-overexpose">
          {value}
        </span>
        <button
          type="button"
          onClick={onCopy}
          aria-label={`Copy ${label.toLowerCase()}`}
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
            copied ? "bg-kodak text-darkroom" : "text-halide/60 hover:bg-halide/10 hover:text-halide",
          )}
        >
          {copied ? (
            <Check aria-hidden className="size-3.5" strokeWidth={3} />
          ) : (
            <Copy aria-hidden className="size-3.5" />
          )}
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
    </div>
  );
}

/**
 * The app's "Join manually" fallback as one quiet row: factory network
 * and password, each one tap to copy.
 */
export function JoinDetails() {
  return (
    <div className="border-t border-halide/15 pt-6">
      <p className="text-sm text-halide/60">
        Prompt didn&apos;t show? Join it yourself in Wi-Fi settings:
      </p>
      <div className="mt-4 flex flex-wrap gap-x-10 gap-y-4">
        <CopyValue label="Network" value={CAMERA_WIFI.network} />
        <CopyValue label="Password" value={CAMERA_WIFI.password} />
      </div>
    </div>
  );
}
