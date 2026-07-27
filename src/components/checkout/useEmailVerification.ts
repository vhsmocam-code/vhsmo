"use client";

import { usePersistedState } from "./usePersistedState";

export type EmailStatus = "idle" | "checking" | "verified" | "notfound";

/** Validates the entered email by format alone - checkout is open to all. */
export function useEmailVerification() {
  const [email, setEmail] = usePersistedState("checkout:email", "");
  const isFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const status: EmailStatus = isFormatValid ? "verified" : "idle";

  return { email, setEmail, status };
}
