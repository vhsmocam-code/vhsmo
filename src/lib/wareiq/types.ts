/**
 * Live shipment data parsed from WareIQ's public tracking page. Types only -
 * safe to import from client components (the parser itself is server-only).
 */

export type TrackingStage =
  | "packed"
  | "picked"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "rto"
  | "other";

export type TrackingStep = {
  label: string;
  location: string | null;
  time: string | null;
  done: boolean;
};

export type TrackingUpdate = {
  time: string;
  location: string;
  remark: string;
};

export type LiveTracking = {
  /** Headline status as WareIQ shows it, e.g. "Out for delivery". */
  status: string;
  stage: TrackingStage;
  /** As displayed by WareIQ, e.g. "14 Nov 2026, 12:58 PM". */
  orderDate: string | null;
  courier: string | null;
  awb: string;
  /** `ETA` / `21 Nov`, `ETA` / `Arriving Soon`, or `Remarks` / … once delivered. */
  eta: { label: string; value: string } | null;
  steps: TrackingStep[];
  latest: { status: string; time: string | null } | null;
  /** Full event history, newest first. */
  updates: TrackingUpdate[];
  /** ISO time we fetched it, for "Updated x min ago". */
  fetchedAt: string;
};
