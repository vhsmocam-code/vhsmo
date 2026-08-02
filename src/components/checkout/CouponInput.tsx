import { useState } from "react";
import { AlertCircle, Loader2, Tag } from "lucide-react";
import { track } from "@vercel/analytics";

type Props = {
  onApply: (code: string) => void;
  loading: boolean;
  error?: string;
};

export function CouponInput({ onApply, loading, error }: Props) {
  const [code, setCode] = useState("");
  const trimmed = code.trim();

  const submit = () => {

    if (!trimmed || loading) return;
    track("coupon_applied", { source: "checkout" });

    onApply(trimmed);
  };

  return (
    <div className="mt-4 space-y-2">
      <label
        htmlFor="coupon-code"
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-darkroom/55"
      >
        <Tag className="size-3.5" />
        Have a coupon?
      </label>

      <div className="flex gap-2">
        <input
          id="coupon-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="EARLY500"
          aria-invalid={Boolean(error)}
          autoCapitalize="characters"
          spellCheck={false}
          className="h-12 flex-1 rounded-xl border-2 border-darkroom/12 bg-overexpose px-4 text-sm font-semibold uppercase tracking-wide text-darkroom transition-colors placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-darkroom/35 focus:border-bluehour focus:outline-none aria-[invalid=true]:border-red-400"
        />

        <button
          type="button"
          onClick={submit}
          disabled={loading || !trimmed}
          className="flex h-12 min-w-[92px] items-center justify-center gap-1.5 rounded-xl bg-darkroom px-5 text-sm font-bold text-overexpose transition-all duration-300 ease-[var(--ease-out-expo)] hover:bg-darkroom/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
        </button>
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-500">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </p>
      )}

      <p className="text-xs text-darkroom/55">
        Were you promised a lower price? DM us{" "}
        <a
          href="https://instagram.com/vhsmo.cam_"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-darkroom underline underline-offset-2 hover:text-bluehour"
        >
          @vhsmo.cam_
        </a>
      </p>
    </div>
  );
}
