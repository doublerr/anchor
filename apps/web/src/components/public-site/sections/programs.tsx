import { Section } from "@/components/public-site/ui/section";
import { SitePhoto } from "@/components/public-site/ui/site-photo";
import { list, text } from "@/components/public-site/lib";
import type { Program } from "@/lib/org";
import type { PublicSite } from "@/lib/public-site";

/** Miller's Law — three on the home page, the rest on the Programs sub-page. */
const MAX_ON_HOME = 3;

/**
 * One program card.
 *
 * The whole card is the target when the program links somewhere, via a stretched
 * overlay on the title link: the old design put the only tap target on a 12px
 * "Learn more →" at the bottom, which on a phone is a small thing to hit for
 * what is the main action of the section (Fitts's Law). Keeping it as a real
 * anchor rather than an onClick means it still middle-clicks, previews on
 * hover, and reads correctly to a screen reader.
 */
function ProgramCard({ program }: { program: Program }) {
  const href = text(program.cta_url);
  const audience = text(program.audience);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-club-accent focus-within:border-club-accent">
      <SitePhoto
        src={program.image_url}
        alt=""
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="aspect-[3/2]"
        imageClassName="transition duration-500 group-hover:scale-[1.03]"
      />
      <div className="flex flex-1 flex-col p-6">
        {audience ? (
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {audience}
          </p>
        ) : null}
        <h3 className="mt-1.5 text-club-h3 font-semibold tracking-tight text-foreground">
          {href ? (
            <a
              href={href}
              className="rounded-sm outline-none after:absolute after:inset-0 focus-visible:underline"
            >
              {program.name}
            </a>
          ) : (
            program.name
          )}
        </h3>
        {text(program.blurb) ? (
          <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">
            {program.blurb}
          </p>
        ) : null}
        {href ? (
          <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-club-accent-text">
            {text(program.cta_label) ?? "Learn more"}
            <span aria-hidden className="transition group-hover:translate-x-0.5">
              →
            </span>
          </p>
        ) : null}
      </div>
    </article>
  );
}

/** The grid, reused by the home page and the Programs sub-page. */
export function ProgramsGrid({ programs }: { programs: Program[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {programs.map((p, i) => (
        <ProgramCard key={i} program={p} />
      ))}
    </div>
  );
}

export function Programs({ site }: { site: PublicSite }) {
  const programs = list(site.programs);
  if (!programs) return null;
  const shown = programs.slice(0, MAX_ON_HOME);

  return (
    <Section
      id="programs"
      tone="muted"
      width="wide"
      eyebrow="What we offer"
      title="Programs"
      lede={text(site.programs_intro)}
      action={
        programs.length > shown.length
          ? { label: `All ${programs.length} programs`, href: `/${site.slug}/programs` }
          : { label: "See all programs", href: `/${site.slug}/programs` }
      }
    >
      <ProgramsGrid programs={shown} />
    </Section>
  );
}
