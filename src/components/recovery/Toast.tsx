"use client";

import { useEffect } from "react";
import { Check, X } from "lucide-react";

export type ToastState = {
  kind: "success" | "error";
  message: string;
} | null;

/**
 * A dependency-free toast for the recovery flow - a single fixed banner that
 * auto-dismisses. Kept tiny on purpose: this whole flow is temporary, so it
 * isn't worth pulling in a toast library.
 */
export function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastState;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, toast.kind === "success" ? 4000 : 6000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const success = toast.kind === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <div
        className={`flex max-w-md items-start gap-3 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
          success ? "bg-bluehour text-halide" : "bg-red-600 text-white"
        }`}
      >
        <span className="mt-0.5 shrink-0">
          {success ? (
            <Check className="size-4" aria-hidden />
          ) : (
            <X className="size-4" aria-hidden />
          )}
        </span>
        <span className="flex-1">{toast.message}</span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
