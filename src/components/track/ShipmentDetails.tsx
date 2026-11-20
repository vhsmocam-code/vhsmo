"use client";

import {
  ArrowUpRight,
  Box,
  ChevronDown,
  CircleCheck,
  MapPin,
  PackageCheck,
  Truck,
  Undo2,
} from "lucide-react";
import type { Shipment } from "@/lib/track-order";
import type { TrackingStage, TrackingUpdate } from "@/lib/wareiq/types";

function titleCase(s: string) {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Headline colour per stage. Kodak yellow only works as a fill, not text. */
const STAGE_BADGE: Record<TrackingStage, string> = {
  packed: "bg-darkroom/10 text-darkroom",
  picked: "bg-bluehour/10 text-bluehour",
  in_transit: "bg-bluehour/10 text-bluehour",
  out_for_delivery: "bg-kodak text-darkroom",
  delivered: "bg-emerald-600/10 text-emerald-700",
  rto: "bg-red-500/10 text-red-600",
  other: "bg-darkroom/10 text-darkroom",
};

const STAGE_ICON: Record<TrackingStage, typeof Truck> = {
  packed: Box,
  picked: PackageCheck,
  in_transit: Truck,
  out_for_delivery: Truck,
  delivered: CircleCheck,
  rto: Undo2,
  other: Box,
};

/** "20 Nov 2026, 09:40:13" → ["20 Nov 2026", "09:40"]. */
function splitStamp(stamp: string): [string, string] {
  const [day = stamp, time = ""] = stamp.split(",").map((s) => s.trim());
  return [day, time.slice(0, 5)];
}

function groupByDay(updates: TrackingUpdate[]) {
  const groups: { day: string; items: (TrackingUpdate & { clock: string })[] }[] =
    [];
  for (const u of updates) {
    const [day, clock] = splitStamp(u.time);
    const last = groups.at(-1);
    if (last?.day === day) last.items.push({ ...u, clock });
    else groups.push({ day, items: [{ ...u, clock }] });
  }
  return groups;
}

function ExternalLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs font-semibold text-darkroom/50 underline-offset-4 hover:text-darkroom hover:underline"
    >
      Open on WareIQ
      <ArrowUpRight className="size-3.5" aria-hidden />
    </a>
  );
}

/** Small "Order ID · date · courier · AWB" line under the headline. */
function MetaLine({ shipment }: { shipment: Shipment }) {
  const ordered = shipment.live?.orderDate ?? formatDate(shipment.orderDate);
  const parts = [
    ordered && `Ordered ${ordered}`,
    shipment.courier && `via ${shipment.courier}`,
    shipment.awb && `AWB ${shipment.awb}`,
  ].filter(Boolean);
  return (
    <div className="mt-2 flex flex-col gap-0.5 text-xs text-darkroom/55">
      <span className="break-all font-bold text-darkroom">{shipment.orderId}</span>
      {shipment.product && <span>{shipment.product}</span>}
      {parts.length > 0 && (
        <span>
          {parts.map((p, i) => (
            <span key={i}>
              {i > 0 && " · "}
              <span className="whitespace-nowrap">{p}</span>
            </span>
          ))}
        </span>
      )}
    </div>
  );
}

function LiveBody({ shipment }: { shipment: Shipment }) {
  const live = shipment.live!;
  const Icon = STAGE_ICON[live.stage];
  const delivered = live.stage === "delivered";
  const currentIdx = live.steps.findLastIndex((s) => s.done);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${STAGE_BADGE[live.stage]}`}
          >
            <Icon className="size-3.5" aria-hidden />
            {live.status}
          </span>
          <MetaLine shipment={shipment} />
        </div>
        {live.eta && (
          <div className="shrink-0 rounded-xl border-2 border-darkroom/10 bg-halide/60 px-4 py-3 sm:max-w-[14rem] sm:text-right">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-darkroom/50">
              {delivered ? "Delivered" : live.eta.label === "ETA" ? "Expected by" : live.eta.label}
            </p>
            <p
              className={
                delivered
                  ? "mt-0.5 text-sm font-semibold text-darkroom"
                  : "font-marker mt-0.5 text-2xl leading-tight text-darkroom"
              }
            >
              {delivered && live.latest?.time
                ? live.latest.time.replace(/^\w+, /, "")
                : live.eta.value}
            </p>
          </div>
        )}
      </div>

      {live.steps.length > 0 && (
        <ol className="mt-6 flex flex-col sm:mb-7 sm:flex-row">
          {live.steps.map((step, i) => {
            const isCurrent = i === currentIdx;
            const isLast = i === live.steps.length - 1;
            return (
              <li
                key={`${step.label}-${i}`}
                className="flex gap-3 sm:min-w-0 sm:flex-1 sm:flex-col sm:gap-2.5"
              >
                <div className="flex flex-col items-center sm:flex-row">
                  <span
                    className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      step.done
                        ? "border-bluehour bg-bluehour text-halide"
                        : "border-darkroom/20 bg-overexpose"
                    } ${isCurrent ? "ring-4 ring-bluehour/20" : ""}`}
                    aria-hidden
                  >
                    {step.done && <CircleCheck className="size-3" />}
                  </span>
                  {!isLast && (
                    <span
                      className={`w-0.5 flex-1 sm:h-0.5 sm:w-auto ${
                        step.done && i < currentIdx ? "bg-bluehour" : "bg-darkroom/15"
                      }`}
                      aria-hidden
                    />
                  )}
                </div>
                <div
                  className={`min-w-0 pb-5 sm:pb-0 sm:pr-2 ${step.done ? "" : "opacity-45"}`}
                >
                  <p
                    className={`text-sm ${isCurrent ? "font-bold text-darkroom" : "font-semibold text-darkroom/80"}`}
                  >
                    {step.label}
                    {isCurrent && <span className="sr-only"> (current)</span>}
                  </p>
                  {(step.location || step.time) && (
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-darkroom/55 sm:flex-col sm:items-start sm:gap-y-0.5">
                      {step.location && (
                        <span className="inline-flex items-start gap-1 break-words">
                          <MapPin className="mt-0.5 size-3 shrink-0" aria-hidden />
                          <span className="min-w-0">{step.location}</span>
                        </span>
                      )}
                      {step.time && <span>{step.time}</span>}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {live.updates.length > 0 && (
        <details className="group rounded-xl border-2 border-darkroom/10">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-bold text-darkroom [&::-webkit-details-marker]:hidden">
            View all updates ({live.updates.length})
            <ChevronDown
              className="size-4 transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <div className="max-h-96 overflow-y-auto border-t-2 border-darkroom/10 px-4 py-3">
            {groupByDay(live.updates).map((g) => (
              <div key={g.day} className="mb-4 last:mb-0">
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-darkroom/45">
                  {g.day}
                </p>
                <ul className="mt-1.5 flex flex-col gap-2">
                  {g.items.map((u, i) => (
                    <li key={i} className="grid grid-cols-[3rem_1fr] gap-2 text-xs">
                      <span className="tabular-nums text-darkroom/50">{u.clock}</span>
                      <span className="min-w-0">
                        <span className="font-semibold text-darkroom">{u.remark}</span>
                        {u.location && (
                          <span className="block text-darkroom/50">{u.location}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-darkroom/45">
          Live from {live.courier ?? "the courier"} via WareIQ
        </p>
        {shipment.trackingUrl && <ExternalLink href={shipment.trackingUrl} />}
      </div>
    </>
  );
}

/** No live data: shipped but WareIQ unavailable, or not shipped yet. */
function FallbackBody({ shipment }: { shipment: Shipment }) {
  const shipped = Boolean(shipment.awb);
  const eta = formatDate(shipment.expectedDelivery);
  const ordered = formatDate(shipment.orderDate);
  return (
    <>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
          shipped ? "bg-bluehour/10 text-bluehour" : "bg-darkroom/10 text-darkroom"
        }`}
      >
        {shipped ? <Truck className="size-3.5" aria-hidden /> : <Box className="size-3.5" aria-hidden />}
        {shipment.status ? titleCase(shipment.status) : "Shipped"}
      </span>
      <MetaLine shipment={shipment} />
      {shipped ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-darkroom/55">
            Last known status{eta ? ` · Expected by ${eta}` : ""}. Live tracking
            is unavailable right now.
          </p>
          {shipment.trackingUrl && <ExternalLink href={shipment.trackingUrl} />}
        </div>
      ) : (
        <p className="mt-4 text-xs text-darkroom/55">
          {ordered ? `Ordered ${ordered}. ` : ""}Orders ship within 48-72 hours -
          tracking will appear here once it&apos;s on its way.
        </p>
      )}
    </>
  );
}

function Body({ shipment }: { shipment: Shipment }) {
  return shipment.live ? (
    <LiveBody shipment={shipment} />
  ) : (
    <FallbackBody shipment={shipment} />
  );
}

/**
 * One order on /track-order. With live WareIQ data: status, ETA, a progress
 * stepper and the full event history. Without it: the last status we have and
 * a link to WareIQ. `collapsible` (phone search with several orders) wraps it
 * in a disclosure showing just the order and status until opened.
 */
export function ShipmentDetails({
  shipment,
  collapsible = false,
  defaultOpen = true,
}: {
  shipment: Shipment;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  if (!collapsible) {
    return (
      <article className="rounded-2xl border-2 border-darkroom/10 bg-overexpose p-5 sm:p-6">
        <Body shipment={shipment} />
      </article>
    );
  }
  return (
    <details
      open={defaultOpen}
      className="group/order rounded-2xl border-2 border-darkroom/10 bg-overexpose"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block break-all text-sm font-bold text-darkroom">
            {shipment.orderId}
          </span>
          <span className="text-xs text-darkroom/55">
            {shipment.status ? titleCase(shipment.status) : "Order placed"}
            {shipment.product ? ` · ${shipment.product}` : ""}
          </span>
        </span>
        <ChevronDown
          className="size-4 shrink-0 text-darkroom/60 transition-transform group-open/order:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="border-t-2 border-darkroom/10 p-5 sm:p-6">
        <Body shipment={shipment} />
      </div>
    </details>
  );
}

/** Placeholder while the lookup + live fetch runs (~2-3s cold). */
export function ShipmentSkeleton() {
  return (
    <div
      className="animate-pulse rounded-2xl border-2 border-darkroom/10 bg-overexpose p-5 sm:p-6"
      aria-hidden
    >
      <div className="h-6 w-40 rounded-full bg-darkroom/10" />
      <div className="mt-3 h-3 w-56 rounded bg-darkroom/10" />
      <div className="mt-2 h-3 w-44 rounded bg-darkroom/10" />
      <div className="mt-6 flex flex-col gap-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="size-5 rounded-full bg-darkroom/10" />
            <div className="flex-1">
              <div className="h-3 w-28 rounded bg-darkroom/10" />
              <div className="mt-2 h-2.5 w-48 rounded bg-darkroom/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
