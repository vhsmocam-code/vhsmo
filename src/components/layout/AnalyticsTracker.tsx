"use client";

import { useEffect } from "react";

export default function AnalyticsTracker() {
  useEffect(() => {
    let sessionId = localStorage.getItem("session_id");

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("session_id", sessionId);
    }

    const source = new URLSearchParams(window.location.search).get("src");

    if (source === "instagramdm") {
      fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          source,
        }),
      });
    }
  }, []);

  return null;
}
