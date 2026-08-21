import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Public, indexable URLs. Auth pages (login/signup) and the dashboard are
 * intentionally excluded — they carry no SEO value and are gated.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
