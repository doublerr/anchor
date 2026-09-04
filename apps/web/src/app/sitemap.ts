import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { listSitemapSites } from "@/lib/public-site";

// Rebuilt on the same cadence as the club pages themselves.
export const revalidate = 3600;

/**
 * Public, indexable URLs: the marketing home plus every published club page.
 *
 * Listing the clubs is the point. Each club site lives at
 * `anchorplatforms.site/{slug}`, so it inherits the apex domain's authority
 * instead of starting from zero the way a brand-new club domain would — but a
 * page no crawler has been told about still has to be discovered by luck.
 * Submitting them puts every club in the index and gives each one a <lastmod>,
 * so an edit in the site editor is a reason to recrawl.
 *
 * Auth and app routes are intentionally absent — they're gated and carry no SEO
 * value (robots.ts disallows them too).
 *
 * Scale note: a sitemap is capped at 50,000 URLs. At roughly three URLs per
 * club that's a ceiling near 16k clubs; past that, split with Next's
 * `generateSitemaps`.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sites = await listSitemapSites();

  const clubs: MetadataRoute.Sitemap = sites.flatMap((site) => {
    const base = `${SITE_URL}/${site.slug}`;
    const entries: MetadataRoute.Sitemap = [
      {
        url: base,
        lastModified: site.lastModified,
        changeFrequency: "weekly",
        priority: 0.8,
      },
    ];
    if (site.hasAboutPage) {
      entries.push({
        url: `${base}/about`,
        lastModified: site.lastModified,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
    if (site.hasProgramsPage) {
      entries.push({
        url: `${base}/programs`,
        lastModified: site.lastModified,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
    return entries;
  });

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...clubs,
  ];
}
