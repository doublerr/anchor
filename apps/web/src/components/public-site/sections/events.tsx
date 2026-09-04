import { Section } from "@/components/public-site/ui/section";
import { SitePhoto } from "@/components/public-site/ui/site-photo";
import { list, text } from "@/components/public-site/lib";
import type { PublicSite } from "@/lib/public-site";

/** Three upcoming things is a plan; ten is a calendar nobody reads. */
const MAX_EVENTS = 3;

/**
 * Events & clinics — image cards with the date treated as the anchor a visitor
 * scans for. Like the program cards, the whole card is the target when the event
 * links out.
 */
export function Events({ site }: { site: PublicSite }) {
  const events = list(site.events)?.slice(0, MAX_EVENTS);
  if (!events) return null;

  return (
    <Section
      id="events"
      tone="muted"
      width="wide"
      eyebrow="What's coming up"
      title="Events &amp; clinics"
    >
      <div className="grid gap-6 md:grid-cols-3">
        {events.map((e, i) => {
          const href = text(e.url);
          return (
            <article
              key={i}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-club-accent focus-within:border-club-accent"
            >
              <SitePhoto
                src={e.image_url}
                alt=""
                sizes="(max-width: 768px) 100vw, 33vw"
                className="aspect-[16/9]"
                imageClassName="transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="flex flex-1 flex-col p-6">
                {text(e.date) ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-club-accent-text">
                    {e.date}
                  </p>
                ) : null}
                <h3 className="mt-1.5 text-club-h3 font-semibold tracking-tight text-foreground">
                  {href ? (
                    <a
                      href={href}
                      className="rounded-sm outline-none after:absolute after:inset-0 focus-visible:underline"
                    >
                      {e.title}
                    </a>
                  ) : (
                    e.title
                  )}
                </h3>
                {text(e.blurb) ? (
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {e.blurb}
                  </p>
                ) : null}
                {href ? (
                  <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-club-accent-text">
                    Details
                    <span
                      aria-hidden
                      className="transition group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
