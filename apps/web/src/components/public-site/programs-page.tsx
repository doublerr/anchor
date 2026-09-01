import Link from "next/link";
import {
  ProgramsGrid,
  Section,
  SiteHeader,
  navSections,
} from "@/components/public-site/club-site";
import type { PublicSiteData } from "@/lib/public-site";

/**
 * The club's Programs sub-page: an intro plus the full list of programs. Reuses
 * the site header (links jump back to home sections) and the shared programs
 * grid. Linked from the home Programs section and the header.
 */
export function ProgramsPage({ data }: { data: PublicSiteData }) {
  const { site, locations, team } = data;
  const sections = navSections(site, locations, team);
  const programs = site.programs ?? [];

  return (
    <>
      <SiteHeader site={site} sections={sections} hrefBase={`/${site.slug}`} />

      {/* Page heading */}
      <Section>
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Link
            href={`/${site.slug}`}
            className="mb-4 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            ← Back to {site.name}
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Programs
          </h1>
          {site.programs_intro?.trim() ? (
            <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
              {site.programs_intro}
            </p>
          ) : null}
        </div>
      </Section>

      {programs.length > 0 ? (
        <Section tinted>
          <ProgramsGrid programs={programs} />
        </Section>
      ) : null}
    </>
  );
}
