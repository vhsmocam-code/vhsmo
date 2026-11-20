"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, Package } from "lucide-react";
import {
  QUERY_MAX,
  detectQuery,
  queryError,
  type Shipment,
} from "@/lib/track-order";
import { ShipmentDetails, ShipmentSkeleton } from "./ShipmentDetails";

type Status = "idle" | "searching" | "found" | "error";

// text-base on mobile (16px) stops iOS Safari from auto-zooming on focus;
// md:text-sm restores the 14px desktop look.
const INPUT_CLASS =
  "w-full min-w-0 rounded-xl border-2 bg-overexpose px-4 py-3 text-base md:text-sm text-darkroom outline-none transition-colors placeholder:text-darkroom/35 disabled:opacity-50";
const INPUT_OK =
  "border-darkroom/15 hover:border-darkroom/30 focus:border-darkroom";
const INPUT_BAD = "border-red-500/60 focus:border-red-500";
const LABEL_CLASS =
  "text-xs font-bold uppercase tracking-wider text-darkroom/60";

/**
 * The form behind /track-order. One box takes an order ID (`order_XXXX`,
 * `VHSMO-XXXX` or the bare suffix) or the phone number on the order, and asks
 * /api/track-order for the order(s). The API attaches live tracking scraped
 * from WareIQ, which renders right here below the box - customers never leave
 * the site.
 */
export function TrackOrderForm() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);

  const resultsRef = useRef<HTMLElement>(null);

  const searching = status === "searching";

  // Once the order lands, glide so the "Your order" card sits in the middle of
  // the screen. The site runs Lenis smooth scroll (exposed as window.__lenis),
  // which swallows native smooth scrolling, so drive that when it's there.
  // A card taller than the screen aligns its top just below the header
  // instead, so the heading is never cut off.
  useEffect(() => {
    if (status !== "found") return;
    const frame = requestAnimationFrame(() => {
      const el = resultsRef.current;
      if (!el) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const rect = el.getBoundingClientRect();
      const tall = rect.height > window.innerHeight - 96;
      const offset = tall ? -96 : -(window.innerHeight - rect.height) / 2;
      const lenis = (
        window as unknown as {
          __lenis?: {
            scrollTo: (t: HTMLElement, o: { offset: number }) => void;
          };
        }
      ).__lenis;
      if (lenis) {
        lenis.scrollTo(el, { offset });
      } else {
        window.scrollTo({
          top: window.scrollY + rect.top + offset,
          behavior: reduce ? "auto" : "smooth",
        });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [status, shipments]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (searching) return;

    if (!detectQuery(query)) {
      setStatus("error");
      setMessage(queryError(query));
      setShipments([]);
      return;
    }

    setStatus("searching");
    setMessage(null);
    setShipments([]);
    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success && Array.isArray(data.shipments)) {
        setShipments(data.shipments as Shipment[]);
        setStatus("found");
        return;
      }
      setMessage(
        typeof data?.message === "string"
          ? data.message
          : "That didn't work - please try again in a moment.",
      );
      setStatus("error");
    } catch {
      setMessage(
        "We couldn't reach our servers - check your connection and try again.",
      );
      setStatus("error");
    }
  }

  const hasError = status === "error" && Boolean(message);
  const many = shipments.length > 1;

  return (
    <div className="flex flex-col gap-6">
      <form
        className="flex flex-col gap-4 rounded-2xl bg-halide p-6 sm:p-8"
        onSubmit={onSubmit}
        noValidate
      >
        <label className="flex flex-col gap-1.5">
          <span className={LABEL_CLASS}>Order ID or phone number</span>
          <input
            type="text"
            name="query"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (status === "error") {
                setStatus("idle");
                setMessage(null);
              }
            }}
            disabled={searching}
            required
            placeholder="order_XXXX or 98765 43210"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={QUERY_MAX}
            aria-invalid={hasError}
            aria-describedby={hasError ? "track-error" : "track-hint"}
            className={`${INPUT_CLASS} ${hasError ? INPUT_BAD : INPUT_OK}`}
          />
          {hasError ? (
            <p
              id="track-error"
              role="alert"
              className="status-rise flex items-start gap-1 pl-1 text-xs font-semibold text-red-500"
            >
              <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
              {message}
            </p>
          ) : (
            <span id="track-hint" className="text-xs text-darkroom/45">
              Your order ID is in your order confirmation email. Or use the
              phone number you checked out with.
            </span>
          )}
        </label>

        <button
          type="submit"
          disabled={searching}
          className="mt-1 flex items-center justify-center gap-2 rounded-full bg-bluehour px-6 py-3 text-sm font-bold text-halide transition-colors duration-300 hover:bg-kodak hover:text-darkroom disabled:cursor-not-allowed disabled:bg-darkroom/20 disabled:text-darkroom/40"
        >
          {searching && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {searching ? "Fetching live status..." : "Track order"}
        </button>
      </form>

      {(searching || (status === "found" && shipments.length > 0)) && (
        <section
          ref={resultsRef}
          aria-live="polite"
          aria-busy={searching}
          className="status-rise rounded-2xl bg-halide p-3 sm:p-8"
        >
          <div className="flex items-center gap-2 px-2 pt-1 text-darkroom sm:px-0 sm:pt-0">
            <Package className="size-5" aria-hidden />
            <h2 className="font-marker text-2xl">
              {searching
                ? "Finding your order"
                : many
                  ? `${shipments.length} orders found`
                  : "Your order"}
            </h2>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {searching ? (
              <ShipmentSkeleton />
            ) : (
              shipments.map((s, i) => (
                <ShipmentDetails
                  key={s.orderId}
                  shipment={s}
                  collapsible={many}
                  defaultOpen={i === 0}
                />
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
