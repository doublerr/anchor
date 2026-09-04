import Link from "next/link";
import Image from "next/image";
import { TargetMark } from "@/components/marketing/icons";
import { SITE_NAME } from "@/lib/site";
import {
  SOCIAL_LABELS,
  primaryAddress,
  text,
  type NavItem,
} from "@/components/public-site/lib";
import type { PublicSite } from "@/lib/public-site";

/**
 * The club's footer.
 *
 * Two jobs. First, it is where the address, phone and email are expected to be
 * (Jakob's Law) — a visitor who has scrolled to the bottom looking for them
 * should not have to scroll back up. Second, it carries the full sitemap: the
 * header bar shows at most five links, and everything trimmed from it is listed
 * here, so capping the nav never costs reachability.
 */
export function SiteFooter({
  site,
  sections,
  hrefBase = "",
}: {
  site: PublicSite;
  sections: NavItem[];
  hrefBase?: string;
}) {
  const address = primaryAddress(site);
  const phone = text(site.phone);
  const email = text(site.email);
  const socials = SOCIAL_LABELS.filter(([k]) => text(site.social_links?.[k]));

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <a
              href={hrefBase || "#top"}
              className="flex items-center gap-2.5"
            >
              {site.logo_url ? (
                <Image
                  src={site.logo_url}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <TargetMark className="h-9 w-9 text-foreground" />
              )}
              <span className="text-base font-semibold tracking-tight text-foreground">
                {site.name}
              </span>
            </a>
            {text(site.tagline) ? (
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {site.tagline}
              </p>
            ) : null}
            {socials.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {socials.map(([k, label]) => (
                  <a
                    key={k}
                    href={site.social_links?.[k]}
                    target="_blank"
                    rel="noreferrer"
                    className="club-tap inline-flex items-center rounded-full border border-border px-4 text-sm text-muted-foreground transition hover:border-club-accent hover:text-foreground"
                  >
                    {label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {sections.length > 0 ? (
            <nav aria-label="Footer">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Explore
              </h2>
              <ul className="mt-4 flex flex-col gap-1">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.href ?? `${hrefBase}#${s.id}`}
                      className="club-tap inline-flex items-center text-sm text-muted-foreground transition hover:text-foreground"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Contact
            </h2>
            <ul className="mt-4 flex flex-col gap-1 text-sm text-muted-foreground">
              {address ? (
                <li>
                  <address className="not-italic leading-relaxed">
                    {address}
                  </address>
                </li>
              ) : null}
              {phone ? (
                <li>
                  <a
                    href={`tel:${phone}`}
                    className="club-tap inline-flex items-center transition hover:text-foreground"
                  >
                    {phone}
                  </a>
                </li>
              ) : null}
              {email ? (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="club-tap inline-flex items-center break-all transition hover:text-foreground"
                  >
                    {email}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {site.name}
          </p>
          {/* Links to the Anchor marketing home. Path-based hosting means the
              apex "/" is that home, so this resolves to the current origin —
              localhost in dev, the real domain in prod. */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <TargetMark className="h-5 w-5" />
            Powered by {SITE_NAME}
          </Link>
        </div>
      </div>
    </footer>
  );
}
