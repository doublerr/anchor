import Link from "next/link";
import {
  Section,
  SiteHeader,
  TeamGrid,
  navSections,
} from "@/components/public-site/club-site";
import type { PublicSiteData } from "@/lib/public-site";

/** A single free-text About section, hidden when empty. */
function Prose({
  id,
  title,
  body,
  tinted,
}: {
  id: string;
  title: string;
  body: string | null;
  tinted?: boolean;
}) {
  if (!body?.trim()) return null;
  return (
    <Section id={id} title={title} tinted={tinted}>
      <div className="mx-auto max-w-3xl whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
        {body}
      </div>
    </Section>
  );
}

/**
 * The club's About sub-page: a deeper dive with Mission, Method, Facilities, and
 * Team sections. Reuses the site header (links jump back to home sections) and
 * the shared Team grid. Each section is hidden when the club has no content.
 */
export function AboutPage({ data }: { data: PublicSiteData }) {
  const { site, locations, team } = data;
  const sections = navSections(site, locations, team);

  return (
    <>
      <SiteHeader
        site={site}
        sections={sections}
        hrefBase={`/${site.slug}`}
      />

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
            About {site.name}
          </h1>
          {site.about?.trim() ? (
            <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
              {site.about}
            </p>
          ) : null}
        </div>
      </Section>

      <Prose id="mission" title="Mission" body={site.mission} />
      <Prose id="method" title="Method" body={site.method} tinted />
      <Prose id="facilities" title="Facilities" body={site.facilities} />

      {team.length > 0 ? (
        <Section id="team" title="Team" tinted>
          <TeamGrid team={team} />
        </Section>
      ) : null}
    </>
  );
}
