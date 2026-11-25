"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { usePersistedState } from "./usePersistedState";

/**
 * Where the email is in the verification flow. "verified" is derived (a live,
 * unexpired token for exactly this address); the rest is what the shopper is
 * doing right now.
 */
export type EmailStatus = "idle" | "sending" | "sent" | "verifying" | "verified";

const TOKEN_KEY = "checkout:emailToken";
const FORMAT_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Fallback if a token's expiry can't be read (server TTL is 15 minutes). */
const FALLBACK_TTL_MS = 14 * 60_000;

const clean = (e: string) => e.trim().toLowerCase();

/** Reads the expiry the server baked into the token. Display/logic only: the
 *  server re-verifies the signature on every order. */
function tokenExpiry(token: string): number | null {
  try {
    const body = token.split(".")[0] ?? "";
    const json = JSON.parse(atob(body.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.e === "number" ? json.e : null;
  } catch {
    return null;
  }
}

type Verified = { email: string; token: string; exp: number };

/**
 * Email ownership for checkout - the same step for online and COD orders.
 * The shopper asks for a code, types it, and gets a signed token that
 * /api/createOrder requires. The token is bound to the address, so editing
 * the email drops the verification; it is kept in sessionStorage so a refresh
 * or a retried payment doesn't ask again.
 */
export function useEmailVerification() {
  const [email, setEmailRaw] = usePersistedState("checkout:email", "");
  const [status, setStatus] = useState<Exclude<EmailStatus, "verified">>("idle");
  const [verified, setVerified] = useState<Verified | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [sentTo, setSentTo] = useState("");
  const [now, setNow] = useState(() => Date.now());

  const emailRef = useRef(email);
  emailRef.current = email;

  const formatOk = FORMAT_RE.test(clean(email));

  // Derived: a token is only good for the exact address it was issued to.
  const isVerified =
    verified !== null && verified.email === clean(email) && verified.exp > now;

  // Restore a verification from this tab (refresh, trip to a policy page).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(TOKEN_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Verified;
      if (saved?.token && saved.exp > Date.now()) setVerified(saved);
      else sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable - the shopper just verifies again */
    }
  }, []);

  // When the token runs out, say so instead of failing at the pay button.
  useEffect(() => {
    if (!verified) return;
    const ms = verified.exp - Date.now();
    if (ms <= 0) return;
    const id = window.setTimeout(() => {
      setNow(Date.now());
      setNotice("Your email verification expired. Please verify again.");
    }, ms + 50);
    return () => window.clearTimeout(id);
  }, [verified]);

  // Resend countdown.
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  const reset = useCallback(() => {
    setStatus("idle");
    setError("");
    setSentTo("");
    setResendIn(0);
  }, []);

  /** Editing the address drops any in-flight code (it belongs to the old one). */
  const setEmail = useCallback(
    (value: string) => {
      setEmailRaw(value);
      setNotice("");
      if (clean(value) !== sentTo) reset();
    },
    [setEmailRaw, sentTo, reset],
  );

  const send = useCallback(async () => {
    const addr = clean(emailRef.current);
    if (!FORMAT_RE.test(addr)) return;
    setStatus("sending");
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/checkout/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addr }),
      });
      const data = await res.json().catch(() => ({}));
      if (typeof data.resendIn === "number") setResendIn(data.resendIn);

      if (res.ok && data.ok) {
        setSentTo(addr);
        setStatus("sent");
        track("email_code_sent", { source: "checkout" });
        return;
      }
      // A code went out moments ago - show the entry boxes rather than an error.
      if (res.status === 429 && typeof data.resendIn === "number" && data.resendIn > 0) {
        setSentTo(addr);
        setStatus("sent");
        setNotice("We already sent you a code a moment ago. Check your inbox (and spam).");
        return;
      }
      setError(data.message ?? "We couldn't send the code. Please try again.");
      setStatus(sentTo === addr ? "sent" : "idle");
    } catch {
      setError("We couldn't send the code. Check your connection and try again.");
      setStatus(sentTo === addr ? "sent" : "idle");
    }
  }, [sentTo]);

  /** Returns true when the code was right. */
  const verify = useCallback(async (code: string): Promise<boolean> => {
    const addr = clean(emailRef.current);
    setStatus("verifying");
    setError("");
    try {
      const res = await fetch("/api/checkout/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addr, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok || !data.token) {
        setError(data.message ?? "That code didn't work. Please try again.");
        setStatus("sent");
        return false;
      }
      const next: Verified = {
        email: addr,
        token: data.token,
        exp: tokenExpiry(data.token) ?? Date.now() + FALLBACK_TTL_MS,
      };
      try {
        sessionStorage.setItem(TOKEN_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      setVerified(next);
      setNow(Date.now());
      setStatus("idle");
      setSentTo("");
      track("email_verified", { source: "checkout" });
      return true;
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("sent");
      return false;
    }
  }, []);

  /** The server refused our token (expired / used): ask the shopper again. */
  const invalidate = useCallback((message?: string) => {
    setVerified(null);
    setNow(Date.now());
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
    reset();
    setNotice(message ?? "Please verify your email again.");
  }, [reset]);

  return {
    email,
    setEmail,
    formatOk,
    status: (isVerified ? "verified" : status) as EmailStatus,
    isVerified,
    /** The signed token to send with the order (null until verified). */
    token: isVerified ? verified!.token : null,
    error,
    notice,
    resendIn,
    send,
    verify,
    cancel: reset,
    invalidate,
  };
}

export type EmailVerification = ReturnType<typeof useEmailVerification>;
