import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lets a second `next dev` run against this checkout without corrupting the
  // first one's build output - two webpack processes sharing .next/ interleave
  // their manifest writes and produce truncated JSON. Unset = normal ".next".
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  // Marketing links shared as /src=<source> (e.g. Instagram DMs) are malformed:
  // the browser treats `src=...` as a path segment, which 404s. Rewrite it into
  // a real `?src=` query param so analytics can read it. The `#reserve` fragment
  // is reapplied by the browser across the redirect, so the page still scrolls
  // to the reserve section.
  async redirects() {
    return [
      {
        source: "/src=:source",
        destination: "/?src=:source",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
