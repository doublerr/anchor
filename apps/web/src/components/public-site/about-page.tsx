import { SiteHeader } from "@/components/public-site/site-header";
import { SiteFooter } from "@/components/public-site/site-footer";
import { MobileActionBar } from "@/components/public-site/mobile-action-bar";
import { SubPageHeader } from "@/components/public-site/sub-page-header";
import { SitePhoto } from "@/components/public-site/ui/site-photo";
import { Section } from "@/components/public-site/ui/section";
import { HighlightStats } from "@/components/public-site/ui/highlights";
import { TeamGrid } from "@/components/public-site/sections/team";
import { ClosingCta } from "@/components/public-site/sections/closing-cta";
import { allNavSections, list, text } from "@/components/public-site/lib";
import type { PublicSiteData } from "@/lib/public-site";

/** A single free-text About section, hidden when empty. */
function Prose({
  id,
  eyebrow,
  title,
  body,
  tone,
}: {
  id: string;
  eyebrow: string;
  title: string;
  body: string | null;
  tone?: "muted";
}) {
  if (!text(body)) return null;
  return (
    <Section id={id} eyebrow={eyebrow} title={title} tone={tone} width="prose">
      <div className="max-w-prose whitespace-pre-line text-club-lede leading-relaxed text-pretty text-muted-foreground">
        {body}
      </div>
    </Section>
  );
}

/**
 * The club's About sub-page: a deeper dive with Mission, Method, Facilities and
 * the full team. Reuses the site header (links jump back to home sections), the
 * shared team grid and the closing invitation, so a visitor who reads to the end
 * here gets the same next step as on the home page.
 */
export function AboutPage({ data }: { data: PublicSiteData }) {
  const { site, locations, team } = data;
  const sections = allNavSections(site, locations, team);
  const hrefBase = `/${site.slug}`;
  const highlights = list(site.highlights);
  const feature = text(site.about_image_url) ?? text(site.hero_image_url);

  return (
    <>
      <SiteHeader site={site} sections={sections} hrefBase={hrefBase} />

      {/* tabIndex -1 so the skip link actually moves focus here, not just the
          sequential-navigation start point. */}
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <SubPageHeader
          site={site}
          eyebrow="About"
          title={`About ${site.name}`}
          lede={text(site.about) ?? text(site.description)}
        />
        {feature ? (
          <div className="mx-auto w-full max-w-6xl px-4 pt-16 sm:px-6 md:pt-24">
            <SitePhoto
              src={feature}
              alt=""
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="aspect-[21/9] rounded-2xl"
              /* Above the fold here, and the page's LCP element. */
              preload
            />
          </div>
        ) : null}
        {highlights ? (
          <Section width="wide">
            <HighlightStats highlights={highlights} />
          </Section>
        ) : null}
        <Prose
          id="mission"
          eyebrow="Why we're here"
          title="Mission"
          body={site.mission}
        />
        <Prose
          id="method"
          eyebrow="How we coach"
          title="Method"
          body={site.method}
          tone="muted"
        />
        <Prose
          id="facilities"
          eyebrow="Where you'll shoot"
          title="Facilities"
          body={site.facilities}
        />
        {team.length > 0 ? (
          <Section
            id="team"
            tone="muted"
            width="wide"
            eyebrow="Who you'll meet"
            title="Our team"
          >
            <TeamGrid team={team} />
          </Section>
        ) : null}
        <ClosingCta site={site} />
      </main>

      <SiteFooter site={site} sections={sections} hrefBase={hrefBase} />
      <MobileActionBar site={site} />
    </>
  );
}
