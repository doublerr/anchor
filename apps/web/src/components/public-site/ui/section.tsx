import type { ReactNode } from "react";
import Link from "next/link";

type Tone = "plain" | "muted";
type Width = "prose" | "default" | "wide";

const WIDTHS: Record<Width, string> = {
  prose: "max-w-3xl",
  default: "max-w-5xl",
  wide: "max-w-6xl",
};

/**
 * The section shell for a club site.
 *
 * Headings are left-aligned with an optional action link pulled to the right
 * edge — the old template centered every heading, which made thirteen sections
 * read as one undifferentiated column. `tone` alternates the ground so adjacent
 * sections separate without a rule between them.
 */
export function Section({
  id,
  eyebrow,
  title,
  lede,
  action,
  children,
  tone = "plain",
  width = "default",
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  lede?: string | null;
  /** Top-right link, e.g. "See all programs". */
  action?: { label: string; href: string };
  children: ReactNode;
  tone?: Tone;
  width?: Width;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 ${tone === "muted" ? "bg-muted/50" : ""} ${className}`}
    >
      <div
        className={`mx-auto w-full ${WIDTHS[width]} px-4 py-16 sm:px-6 md:py-24`}
      >
        {title || eyebrow || lede ? (
          <div className="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 md:mb-14">
            <div className="max-w-2xl">
              {eyebrow ? <SectionEyebrow>{eyebrow}</SectionEyebrow> : null}
              {title ? (
                <h2 className="text-club-h2 font-semibold tracking-tight text-balance text-foreground">
                  {title}
                </h2>
              ) : null}
              {lede ? (
                <p className="mt-3 text-club-lede leading-relaxed text-pretty text-muted-foreground">
                  {lede}
                </p>
              ) : null}
            </div>
            {action ? (
              <Link
                href={action.href}
                className="club-tap group inline-flex items-center gap-1.5 text-sm font-semibold text-club-accent-text underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-club-accent"
              >
                {action.label}
                <span aria-hidden className="transition group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

/**
 * The small label above a heading. Deliberately muted, not accent-colored — the
 * accent is reserved for the one thing per screen we want noticed (the call to
 * action), and sprinkling it over every eyebrow is what made the old template's
 * CTA disappear into the page.
 */
export function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </p>
  );
}

/** A standard content card: one bordered region, per the law of common region. */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-border bg-surface ${className}`}
    >
      {children}
    </div>
  );
}
