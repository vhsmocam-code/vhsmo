import test from "node:test";
import assert from "node:assert/strict";
import { estimateDeliveryWindow, formatDeliveryDate } from "../src/lib/shipping.ts";

const fmt = (w) => [formatDeliveryDate(w.from), formatDeliveryDate(w.to)];

test("Monday order: dispatch Wed-Thu, then 2-7 business days", () => {
  // Mon 23 Nov 2026, 10:00 IST
  assert.deepEqual(fmt(estimateDeliveryWindow(Date.parse("2026-11-23T10:00:00+05:30"))), ["27 Nov", "7 Dec"]);
});

test("Friday order: weekend days never count as transit days", () => {
  // Fri 27 Nov 2026, 10:00 IST - dispatch lands on Sun/Mon
  assert.deepEqual(fmt(estimateDeliveryWindow(Date.parse("2026-11-27T10:00:00+05:30"))), ["1 Dec", "9 Dec"]);
});

test("remote locations use the 7-12 business-day window", () => {
  assert.deepEqual(fmt(estimateDeliveryWindow(Date.parse("2026-11-23T10:00:00+05:30"), true)), ["4 Dec", "14 Dec"]);
});

test("the range is always earliest-first", () => {
  const w = estimateDeliveryWindow(Date.now());
  assert.ok(w.from.getTime() < w.to.getTime());
});
