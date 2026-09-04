import { AnnouncementBar, SiteHeader } from "@/components/public-site/site-header";
import { SiteFooter } from "@/components/public-site/site-footer";
import { MobileActionBar } from "@/components/public-site/mobile-action-bar";
import { Hero } from "@/components/public-site/sections/hero";
import { About } from "@/components/public-site/sections/about";
import { Programs } from "@/components/public-site/sections/programs";
import { Testimonials } from "@/components/public-site/sections/testimonials";
import { Visit } from "@/components/public-site/sections/visit";
import { Pricing } from "@/components/public-site/sections/pricing";
import { Team } from "@/components/public-site/sections/team";
import { Gallery } from "@/components/public-site/sections/gallery";
import { Events } from "@/components/public-site/sections/events";
import { Faqs } from "@/components/public-site/sections/faqs";
import { ClosingCta } from "@/components/public-site/sections/closing-cta";
import {
  allNavSections,
  hasAboutPageContent,
  hasVisit,
  list,
} from "@/components/public-site/lib";
import type { PublicSiteData } from "@/lib/public-site";

/**
 * The standard-design public club site.
 *
 * Every section returns null when the club has no data for it, so a bare club
 * shows a tidy hero, visit block and closing invitation, and a fully filled-in
 * one shows the whole page.
 *
 * The order answers a local visitor's questions roughly in the order they ask
 * them — what is this, what can I do here, is it any good, where is it, what
 * does it cost, who runs it — with the strongest content at the two ends, where
 * it is actually remembered (serial position). Testimonials sit a third of the
 * way down as the page's one full-bleed moment, and the closing block ends on
 * the club's own invitation (peak–end).
 */
export function ClubSite({ data }: { data: PublicSiteData }) {
  const { site, locations, team } = data;
  const sections = allNavSections(site, locations, team);
  const gallery = list(site.gallery);

  return (
    <>
      <AnnouncementBar site={site} />
      <SiteHeader site={site} sections={sections} />

      {/* tabIndex -1 so the skip link actually moves focus here, not just the
          sequential-navigation start point. */}
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Hero site={site} hasVisit={hasVisit(site, locations)} />
        <About site={site} hasAboutPage={hasAboutPageContent(site, team)} />
        <Programs site={site} />
        <Testimonials site={site} />
        <Visit site={site} locations={locations} />
        <Pricing site={site} />
        <Team team={team} />
        {gallery ? <Gallery images={gallery} /> : null}
        <Events site={site} />
        <Faqs site={site} />
        <ClosingCta site={site} />
      </main>

      <SiteFooter site={site} sections={sections} />
      <MobileActionBar site={site} />
    </>
  );
}
