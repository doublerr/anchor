import { SiteHeader } from "@/components/public-site/site-header";
import { SiteFooter } from "@/components/public-site/site-footer";
import { MobileActionBar } from "@/components/public-site/mobile-action-bar";
import { SubPageHeader } from "@/components/public-site/sub-page-header";
import { Section } from "@/components/public-site/ui/section";
import { ProgramsGrid } from "@/components/public-site/sections/programs";
import { ClosingCta } from "@/components/public-site/sections/closing-cta";
import { allNavSections, list, text } from "@/components/public-site/lib";
import type { PublicSiteData } from "@/lib/public-site";

/**
 * The club's Programs sub-page: an intro plus every program, unlike the home
 * page which shows the first three. Reuses the site header, the shared programs
 * grid and the closing invitation.
 */
export function ProgramsPage({ data }: { data: PublicSiteData }) {
  const { site, locations, team } = data;
  const sections = allNavSections(site, locations, team);
  const hrefBase = `/${site.slug}`;
  const programs = list(site.programs);

  return (
    <>
      <SiteHeader site={site} sections={sections} hrefBase={hrefBase} />

      {/* tabIndex -1 so the skip link actually moves focus here, not just the
          sequential-navigation start point. */}
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <SubPageHeader
          site={site}
          eyebrow="What we offer"
          title="Programs"
          lede={text(site.programs_intro)}
        />
        {programs ? (
          <Section width="wide">
            <ProgramsGrid programs={programs} />
          </Section>
        ) : null}
        <ClosingCta site={site} />
      </main>

      <SiteFooter site={site} sections={sections} hrefBase={hrefBase} />
      <MobileActionBar site={site} />
    </>
  );
}
