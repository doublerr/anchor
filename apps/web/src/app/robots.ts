import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Crawl directives. We explicitly welcome AI crawlers (GPTBot, ClaudeBot,
 * PerplexityBot, Google-Extended, …) — being cited in AI answers is a goal,
 * not a risk — while keeping gated app routes out of every crawler's index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Every gated app route, not just /dashboard — these all redirect to
        // /login for a crawler, which wastes crawl budget that should be going
        // to club pages.
        disallow: [
          "/dashboard",
          "/site",
          "/members",
          "/locations",
          "/settings",
          "/onboarding",
          "/create-organization",
          "/login",
          "/signup",
          "/auth/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
