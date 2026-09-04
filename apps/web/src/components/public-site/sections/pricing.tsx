import { Section } from "@/components/public-site/ui/section";
import { list, text } from "@/components/public-site/lib";
import type { PublicSite } from "@/lib/public-site";

/** Three tiers is the classic comparison a visitor can actually hold in mind. */
const MAX_TIERS = 3;

/**
 * Pricing.
 *
 * One tier can be marked featured, and it is the only card carrying the accent
 * (Von Restorff) — an isolated option is the one that gets read first and the
 * one most people take. When nothing is featured every card stays neutral rather
 * than inventing a recommendation the club didn't make.
 */
export function Pricing({ site }: { site: PublicSite }) {
  const pricing = list(site.pricing)?.slice(0, MAX_TIERS);
  if (!pricing) return null;

  return (
    <Section
      id="pricing"
      width="wide"
      eyebrow="Membership"
      title="Pricing"
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pricing.map((p, i) => (
          <div
            key={i}
            className={`relative flex flex-col rounded-2xl border bg-surface p-7 ${
              p.featured
                ? "border-club-accent shadow-lg ring-1 ring-club-accent"
                : "border-border"
            }`}
          >
            {p.featured ? (
              <span className="absolute -top-3 left-7 rounded-full bg-club-accent px-3 py-1 text-xs font-semibold text-club-accent-contrast">
                Most popular
              </span>
            ) : null}
            <h3 className="text-club-h3 font-semibold tracking-tight text-foreground">
              {p.name}
            </h3>
            {text(p.price) ? (
              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold tracking-tight text-foreground">
                  {p.price}
                </span>
                {text(p.cadence) ? (
                  <span className="text-sm text-muted-foreground">
                    {p.cadence}
                  </span>
                ) : null}
              </p>
            ) : null}
            {text(p.note) ? (
              <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                {p.note}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </Section>
  );
}
