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
 * `stop()` freezes the countdown in place and halts the redirect - call it the
 * moment an order is being created so the shopper is never bounced home while
 * their payment is in flight.
 */
export function useCheckoutReservation(active: boolean) {
  const router = useRouter();

  const [remainingMs, setRemainingMs] = useState(RESERVATION_MS);
  const stoppedRef = useRef(false);
  const intervalRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!active || stoppedRef.current) return;

    // Fresh 10 minutes on every arrival - no persistence across reloads.
    const deadline = Date.now() + RESERVATION_MS;
    setRemainingMs(RESERVATION_MS);

    const tick = () => {
      if (stoppedRef.current) return true;
      const left = deadline - Date.now();
      if (left <= 0) {
        setRemainingMs(0);
        stop();
        router.push(EXPIRY_REDIRECT);
        return true;
      }
      setRemainingMs(left);
      return false;
    };

    intervalRef.current = window.setInterval(() => {
      if (tick() && intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 1000);
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [active, router, stop]);

  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const label = `${minutes}:${String(seconds).padStart(2, "0")}`;

  return { label, remainingMs, stop };
}
