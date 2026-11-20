import { parse, type HTMLElement } from "node-html-parser";
import { TRACKING_BASE_URL } from "@/lib/track-order";
import type {
  LiveTracking,
  TrackingStage,
  TrackingStep,
  TrackingUpdate,
} from "./types";

/**
 * Live tracking from WareIQ's public tracking page.
 *
 * `order_tracking` in Supabase is a periodic WareIQ export and lags behind, so
 * /track-order fetches `wareiq.wiq.app/tracking/<awb>` server-side and parses
 * the HTML into `LiveTracking`. The page is server-rendered, so everything is
 * in the response - no JS needed.
 *
 * Scraping is inherently fragile: every failure (non-200, timeout, markup we
 * don't recognise) returns null and the UI falls back to the DB status plus a
 * link to WareIQ. Server-only - only ever import from route handlers.
 */

const FETCH_TIMEOUT_MS = 8000;
/** Seconds Next caches a WareIQ page per AWB. */
const REVALIDATE_SECONDS = 300;

const DATE_RE = /\d{1,2} [A-Za-z]{3} \d{4}/;

/** Collapse whitespace and decode entities. */
function text(el: HTMLElement | null | undefined): string {
  return (el?.text ?? "").replace(/\s+/g, " ").trim();
}

function titleCase(s: string) {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/** "Pune_Vinkar_D (Maharashtra)" → "Pune Vinkar D (Maharashtra)". */
export function cleanLocation(s: string): string {
  return s.replace(/_/g, " ").replace(/\s+/g, " ").trim();
}

export function stageOf(status: string): TrackingStage {
  const s = status.toLowerCase();
  if (/rto|return/.test(s)) return "rto";
  if (s.includes("delivered")) return "delivered";
  if (s.includes("out for delivery")) return "out_for_delivery";
  if (/transit|dispatch/.test(s)) return "in_transit";
  if (/picked|pickup/.test(s)) return "picked";
  if (/packed|received|manifest|ready/.test(s)) return "packed";
  return "other";
}

export function parseWareiqTracking(
  html: string,
  awb: string,
): LiveTracking | null {
  const root = parse(html);

  const status = text(root.querySelector(".order-details h1"));

  const details = new Map<string, string>();
  for (const item of root.querySelectorAll(".order-detail-item")) {
    const label = text(item.querySelector("label")).replace(/:$/, "");
    if (label) details.set(label.toLowerCase(), text(item.querySelector("span")));
  }

  const courierAlt =
    root.querySelector(".courier-image")?.getAttribute("alt")?.trim() ?? "";
  const courier = courierAlt ? titleCase(courierAlt.split("_")[0] ?? "") : null;

  const etaEl = root.querySelector(".eta-info");
  const etaLabel = text(etaEl?.querySelector("label"));
  const etaValue = text(etaEl?.querySelector("h2"));

  const steps: TrackingStep[] = root
    .querySelectorAll(".status-tracker-item")
    .map((item) => {
      const right = item.querySelector(".status-tracker-item-right");
      let location: string | null = null;
      let time: string | null = null;
      for (const line of item.querySelectorAll(".status-city")) {
        const t = text(line);
        if (!t) continue;
        if (DATE_RE.test(t)) time = t;
        else location = cleanLocation(t);
      }
      return {
        label: text(item.querySelector(".status-text")),
        location,
        time,
        done: !right?.classList.contains("disabled"),
      };
    })
    .filter((s) => s.label);

  const updates: TrackingUpdate[] = root
    .querySelectorAll("#updates-modal table tr")
    .map((tr) => tr.querySelectorAll("td").map(text))
    .filter((cells) => cells.length >= 3 && cells[0])
    .map(([time = "", location = "", remark = ""]) => ({
      time,
      location: cleanLocation(location),
      remark,
    }));

  const latestStatus = text(root.querySelector(".latest-status"));

  // No headline and no steps → not a tracking page we understand.
  if (!status && steps.length === 0) return null;

  const headline = status || latestStatus || steps.filter((s) => s.done).at(-1)?.label || "";

  return {
    status: headline,
    stage: stageOf(headline),
    orderDate: details.get("order date") || null,
    courier,
    awb: text(root.querySelector(".awb-number")) || awb,
    eta: etaLabel && etaValue ? { label: etaLabel, value: etaValue } : null,
    steps,
    latest: latestStatus
      ? {
          status: latestStatus,
          time: text(root.querySelector(".latest-status-date")) || null,
        }
      : null,
    updates,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchWareiqTracking(
  awb: string,
): Promise<LiveTracking | null> {
  try {
    const res = await fetch(`${TRACKING_BASE_URL}${encodeURIComponent(awb)}`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; VHSMO-tracking)",
        accept: "text/html",
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) {
      // WareIQ answers 500 for AWBs it doesn't know yet.
      console.warn(`wareiq tracking ${awb}: HTTP ${res.status}`);
      return null;
    }
    const parsed = parseWareiqTracking(await res.text(), awb);
    if (!parsed) console.warn(`wareiq tracking ${awb}: unrecognised markup`);
    return parsed;
  } catch (err) {
    console.warn(`wareiq tracking ${awb}:`, (err as Error).message);
    return null;
  }
}
