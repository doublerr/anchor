import Image from "next/image";
import { TargetMark } from "@/components/marketing/icons";
import { buttonAccent } from "@/components/ui/button-styles";
import { ThemeToggle } from "@/components/public-site/theme-toggle";
import { MobileNav } from "@/components/public-site/mobile-nav";
import { primaryCta, primaryNav, type NavItem } from "@/components/public-site/lib";
import type { PublicSite } from "@/lib/public-site";

/**
 * The club's sticky header.
 *
 * `hrefBase` prefixes the section anchors: "" on the home page (`#about`), or
 * `/{slug}` on a sub-page so links jump back to the home page's sections. The
 * brand links home either way.
 *
 * The desktop bar shows at most five links (see NAV_LIMIT) with the club's call
 * to action as the only filled element, so the one thing we want tapped is the
 * one thing carrying color. Everything else the club has published is still
 * reachable from the footer sitemap and, on a phone, from the full menu sheet.
 */
export function SiteHeader({
  site,
  sections,
  hrefBase = "",
}: {
  site: PublicSite;
  sections: NavItem[];
  hrefBase?: string;
}) {
  const brandHref = hrefBase || "#top";
  const cta = primaryCta(site);
  const bar = primaryNav(sections);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a
          href={brandHref}
          className="club-tap flex min-w-0 items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-club-accent"
        >
          {site.logo_url ? (
            <Image
              src={site.logo_url}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <TargetMark className="h-9 w-9 shrink-0 text-foreground" />
          )}
          <span className="truncate text-base font-semibold tracking-tight text-foreground">
            {site.name}
          </span>
        </a>

        <div className="flex items-center gap-1 sm:gap-2">
          {bar.length > 0 ? (
            <nav aria-label="Primary" className="hidden items-center md:flex">
              {bar.map((s) => (
                <a
                  key={s.id}
                  href={s.href ?? `${hrefBase}#${s.id}`}
                  className="club-tap inline-flex items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-club-accent"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          ) : null}
          <ThemeToggle />
          {cta ? (
            <a
              href={cta.href}
              /* `max-md:hidden`, not `hidden md:inline-flex`: buttonBase already
                 sets `inline-flex`, and two same-specificity utilities resolve
                 by stylesheet order, so plain `hidden` loses. */
              className={`${buttonAccent} ml-1 px-4 py-2 text-sm max-md:hidden`}
            >
              {cta.label}
            </a>
          ) : null}
          <MobileNav items={sections} cta={cta} hrefBase={hrefBase} />
        </div>
      </div>
    </header>
  );
}

/**
 * The club's announcement, above the header so it scrolls away.
 *
 * Deliberately has no button of its own: the old bar repeated the hero's call to
 * action a few hundred pixels above it, so the page opened with two identical
 * competing targets and neither stood out.
 */
export function AnnouncementBar({ site }: { site: PublicSite }) {
  const message = site.announcement?.trim();
  if (!message) return null;
  return (
    <div className="bg-club-accent text-club-accent-contrast">
      <p className="mx-auto w-full max-w-6xl px-4 py-2.5 text-center text-sm font-medium sm:px-6">
        {message}
      </p>
    </div>
  );
}
