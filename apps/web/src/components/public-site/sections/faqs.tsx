import { Section } from "@/components/public-site/ui/section";
import { list } from "@/components/public-site/lib";
import type { PublicSite } from "@/lib/public-site";

/**
 * FAQ.
 *
 * Still native `<details>`, so it opens with no JavaScript at all — the fastest
 * possible response to a tap (Doherty). The summary row is a full-width 56px
 * target with a chevron that rotates on open, rather than the old bare text
 * line that gave no sign it could be opened.
 */
export function Faqs({ site }: { site: PublicSite }) {
  const faqs = list(site.faqs);
  if (!faqs) return null;

  return (
    <Section
      id="faq"
      width="prose"
      eyebrow="Before you come"
      title="Frequently asked questions"
    >
      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {faqs.map((f, i) => (
          <details key={i} className="group">
            <summary className="club-tap flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 font-medium text-foreground transition hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-club-accent">
              {f.q}
              <span
                aria-hidden
                className="shrink-0 text-club-accent-text transition group-open:rotate-45"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </summary>
            <p className="whitespace-pre-line px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
              {f.a}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}
