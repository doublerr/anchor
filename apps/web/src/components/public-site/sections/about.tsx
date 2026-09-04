import Link from "next/link";
import { SitePhoto } from "@/components/public-site/ui/site-photo";
import { Section, SectionEyebrow } from "@/components/public-site/ui/section";
import { HighlightStats } from "@/components/public-site/ui/highlights";
import { hasAbout, list, text } from "@/components/public-site/lib";
import type { PublicSite } from "@/lib/public-site";

/**
 * Miller's Law: three stat tiles is a row a visitor takes in at a glance; six is
 * a table they skim past. Anything the club adds beyond three lives on the
 * About sub-page.
 */
const MAX_HIGHLIGHTS = 3;

/**
 * About — a split layout, photo on one side and copy on the other.
 *
 * The old version was a centered paragraph at full section width, which is both
 * the hardest way to read a long block of text and the least interesting thing
 * to look at. Prose here sits at a comfortable measure and is left-aligned, with
 * a photo carrying the other half.
 */
export function About({
  site,
  hasAboutPage,
}: {
  site: PublicSite;
  hasAboutPage: boolean;
}) {
  const body = text(site.about) ?? text(site.description);
  const highlights = list(site.highlights)?.slice(0, MAX_HIGHLIGHTS);
  if (!hasAbout(site) && !hasAboutPage) return null;

  return (
    <Section id="about" width="wide">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <SitePhoto
          src={site.about_image_url ?? site.hero_image_url}
          alt={`${site.name}`}
          sizes="(max-width: 768px) 100vw, 46vw"
          className="aspect-[4/3] rounded-2xl md:order-last"
        />

        <div>
          <SectionEyebrow>
            {site.founded_year ? `Established ${site.founded_year}` : "About us"}
          </SectionEyebrow>
          <h2 className="text-club-h2 font-semibold tracking-tight text-balance text-foreground">
            About {site.name}
          </h2>
          {body ? (
            <p className="mt-5 max-w-prose whitespace-pre-line text-club-lede leading-relaxed text-pretty text-muted-foreground">
              {body}
            </p>
          ) : null}
          {hasAboutPage ? (
            <Link
              href={`/${site.slug}/about`}
              className="club-tap mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-club-accent-text underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-club-accent"
            >
              More about the club
              <span aria-hidden>→</span>
            </Link>
          ) : null}
        </div>
      </div>

      {highlights ? (
        <HighlightStats highlights={highlights} className="mt-14" />
      ) : null}
    </Section>
  );
}
