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
        disallow: ["/dashboard", "/login", "/signup", "/auth/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
