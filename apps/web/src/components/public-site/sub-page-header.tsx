import Link from "next/link";
import { SectionEyebrow } from "@/components/public-site/ui/section";
import type { PublicSite } from "@/lib/public-site";

/**
 * The heading block shared by the About and Programs sub-pages: a back link to
 * the club home, the page title on the fluid display scale, and an optional
 * lede. Left-aligned to match the home page's section headings.
 */
export function SubPageHeader({
  site,
  eyebrow,
  title,
  lede,
}: {
  site: PublicSite;
  eyebrow: string;
  title: string;
  lede?: string | null;
}) {
  return (
    <div className="border-b border-border bg-club-accent-soft">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <Link
          href={`/${site.slug}`}
          className="club-tap mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-club-accent"
        >
          <span aria-hidden>←</span>
          Back to {site.name}
        </Link>
        <SectionEyebrow>{eyebrow}</SectionEyebrow>
        <h1 className="max-w-3xl text-club-h1 font-bold tracking-tight text-balance text-foreground">
          {title}
        </h1>
        {lede ? (
          <p className="mt-5 max-w-2xl whitespace-pre-line text-club-lede leading-relaxed text-pretty text-muted-foreground">
            {lede}
          </p>
        ) : null}
      </div>
    </div>
  );
}
