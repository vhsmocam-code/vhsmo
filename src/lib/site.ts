/**
 * Single source of truth for the site's canonical origin.
 * Used by metadata (layout), sitemap and robots so the three can never drift
 * apart. Override per-environment with NEXT_PUBLIC_SITE_URL if needed.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.vhsmo.com";
