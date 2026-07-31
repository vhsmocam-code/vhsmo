"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** How long the checkout "reservation" lasts, in milliseconds. */
const RESERVATION_MS = 10 * 60 * 1000;

/** Where to send the shopper once the reservation lapses. */
const EXPIRY_REDIRECT = "/";

/**
 * A static 10-minute countdown that runs while the shopper is on checkout.
 *
 * It's purely a pressure device, not a real inventory hold - it starts fresh
 * at 10:00 every time the shopper lands on checkout (leave and come back and
 * it resets). When it hits zero the shopper is sent back to the home page.
 *
 * Controls:
 *  - `pause()`  freezes the countdown in place (e.g. while the Razorpay overlay
 *               is open) so the shopper is never bounced home mid-payment.
 *  - `resume()` picks the countdown back up from where it paused (e.g. once the
 *               shopper dismisses Razorpay without paying).
 *  - `stop()`   ends the countdown for good (once an order is placed).
 */
export function useCheckoutReservation(active: boolean) {
  const router = useRouter();

  const [remainingMs, setRemainingMs] = useState(RESERVATION_MS);
  // Live remaining time, kept in a ref so pause/resume can read it without
  // waiting for a re-render.
  const remainingRef = useRef(RESERVATION_MS);
  const deadlineRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  // Permanently stopped (order placed) - resume/restart become no-ops.
  const stoppedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Begin (or continue) ticking down from whatever time is left.
  const startTimer = useCallback(() => {
    clearTimer();
    deadlineRef.current = Date.now() + remainingRef.current;

    const tick = () => {
      const left = deadlineRef.current - Date.now();
      if (left <= 0) {
        remainingRef.current = 0;
        setRemainingMs(0);
        stoppedRef.current = true;
        clearTimer();
        router.push(EXPIRY_REDIRECT);
        return;
      }
      remainingRef.current = left;
      setRemainingMs(left);
    };

    tick();
    intervalRef.current = window.setInterval(tick, 1000);
  }, [clearTimer, router]);

  /** Freeze the countdown, keeping the remaining time intact. */
  const pause = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  /** Pick the countdown back up from where it was paused. */
  const resume = useCallback(() => {
    if (stoppedRef.current || !active) return;
    if (intervalRef.current !== null) return; // already running
    if (remainingRef.current <= 0) return;
    startTimer();
  }, [active, startTimer]);

  /** End the countdown for good - the order is placed. */
  const stop = useCallback(() => {
    stoppedRef.current = true;
    clearTimer();
  }, [clearTimer]);

  // Fresh 10 minutes on every arrival - no persistence across reloads.
  useEffect(() => {
    if (!active || stoppedRef.current) return;
    remainingRef.current = RESERVATION_MS;
    setRemainingMs(RESERVATION_MS);
    startTimer();
    return clearTimer;
  }, [active, startTimer, clearTimer]);

  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const label = `${minutes}:${String(seconds).padStart(2, "0")}`;

  return { label, remainingMs, pause, resume, stop };
}
