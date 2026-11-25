"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MailCheck } from "lucide-react";

const LENGTH = 6;

type Props = {
  email: string;
  status: "sending" | "sent" | "verifying";
  error: string;
  notice: string;
  resendIn: number;
  /** Resolves true when the code was accepted. */
  onSubmit: (code: string) => Promise<boolean>;
  onResend: () => void;
  /** "Wrong email?" - drops the code and returns focus to the email field. */
  onEdit: () => void;
};

/**
 * Six digit boxes for the emailed code: type or paste, it advances by itself,
 * and submits the moment the sixth digit lands. Phones offer the code from the
 * email via autocomplete="one-time-code".
 */
export function EmailVerifyPanel({
  email,
  status,
  error,
  notice,
  resendIn,
  onSubmit,
  onResend,
  onEdit,
}: Props) {
  const [digits, setDigits] = useState<string[]>(() => Array(LENGTH).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const submitting = useRef(false);
  const busy = status === "sending" || status === "verifying";

  // Land in the first box once the code is on its way.
  useEffect(() => {
    if (status === "sent") refs.current[0]?.focus();
  }, [status === "sent"]); // eslint-disable-line react-hooks/exhaustive-deps

  const fill = (start: number, text: string) => {
    const incoming = text.replace(/\D/g, "").slice(0, LENGTH - start).split("");
    if (incoming.length === 0) return;
    setDigits((prev) => {
      const next = [...prev];
      incoming.forEach((d, k) => (next[start + k] = d));
      return next;
    });
    refs.current[Math.min(start + incoming.length, LENGTH - 1)]?.focus();
  };

  const code = digits.join("");

  // Submit on the sixth digit.
  useEffect(() => {
    if (code.length !== LENGTH || status !== "sent" || submitting.current) return;
    submitting.current = true;
    void onSubmit(code).then((ok) => {
      submitting.current = false;
      if (!ok) {
        setDigits(Array(LENGTH).fill(""));
        refs.current[0]?.focus();
      }
    });
  }, [code, status, onSubmit]);

  return (
    <div
      role="group"
      aria-labelledby="email-code-title"
      className="status-rise rounded-2xl border-2 border-bluehour/25 bg-bluehour/[0.05] p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-bluehour/12 text-bluehour">
          <MailCheck className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 id="email-code-title" className="text-sm font-bold text-darkroom">
            Enter the 6-digit code
          </h3>
          <p className="mt-0.5 text-xs leading-relaxed text-darkroom/60">
            {status === "sending" ? (
              "Sending your code…"
            ) : (
              <>
                We sent it to{" "}
                <span className="break-all font-semibold text-darkroom">{email.trim()}</span>. It can take a
                minute; check spam if you don&apos;t see it.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 sm:gap-2.5">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={d}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "");
              if (v.length > 1) return fill(i, v); // paste / iOS code suggestion
              setDigits((prev) => {
                const next = [...prev];
                next[i] = v;
                return next;
              });
              if (v && i < LENGTH - 1) refs.current[i + 1]?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digits[i] && i > 0) {
                setDigits((prev) => {
                  const next = [...prev];
                  next[i - 1] = "";
                  return next;
                });
                refs.current[i - 1]?.focus();
              } else if (e.key === "ArrowLeft" && i > 0) {
                refs.current[i - 1]?.focus();
              } else if (e.key === "ArrowRight" && i < LENGTH - 1) {
                refs.current[i + 1]?.focus();
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              fill(0, e.clipboardData.getData("text"));
            }}
            onFocus={(e) => e.target.select()}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={i === 0 ? LENGTH : 1}
            disabled={busy}
            aria-label={`Digit ${i + 1} of ${LENGTH}`}
            aria-invalid={Boolean(error)}
            className={`h-12 w-0 min-w-0 flex-1 rounded-xl border-2 bg-overexpose text-center text-xl font-bold tabular-nums text-darkroom outline-none transition-colors disabled:opacity-60 sm:h-14 sm:max-w-14 ${
              error ? "border-red-400/70" : "border-darkroom/15 focus:border-bluehour"
            }`}
          />
        ))}
        {status === "verifying" && <Loader2 className="size-5 shrink-0 animate-spin text-bluehour" />}
      </div>

      <div aria-live="polite" className="mt-2.5 min-h-4 text-xs">
        {error ? (
          <p role="alert" className="font-semibold text-red-600">
            {error}
          </p>
        ) : notice ? (
          <p className="font-medium text-darkroom/70">{notice}</p>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
        <button
          type="button"
          onClick={onResend}
          disabled={busy || resendIn > 0}
          className="font-semibold text-bluehour disabled:text-darkroom/40"
        >
          {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
        </button>
        <button
          type="button"
          onClick={onEdit}
          disabled={status === "verifying"}
          className="font-semibold text-darkroom/60 underline-offset-2 hover:text-darkroom hover:underline"
        >
          Wrong email? Edit
        </button>
      </div>
    </div>
  );
}
