import type { MetadataRoute } from "next";
import { LEGAL_DOCS } from "@/lib/legal";
import { SITE_URL } from "@/lib/site";

const BASE = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: BASE,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE}/international-order`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE}/track-order`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...LEGAL_DOCS.map((doc) => ({
      url: `${BASE}/legal/${doc.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
