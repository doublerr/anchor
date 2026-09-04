import { TargetMark } from "@/components/marketing/icons";
import { buttonAccent, buttonOnImage, buttonAccentOutline } from "@/components/ui/button-styles";
import { SitePhoto, PhotoScrim } from "@/components/public-site/ui/site-photo";
import { formatAddress, primaryCta, text } from "@/components/public-site/lib";
import type { PublicSite } from "@/lib/public-site";

/**
 * The club's hero.
 *
 * Two designs rather than one with a hole in it: a club that has uploaded a
 * photo gets a full-bleed image with a bottom-weighted scrim, and a club that
 * hasn't gets a typographic hero on a tinted accent ground. Both are meant to
 * look finished — a club filling its site in over several evenings shouldn't
 * see a broken-looking page in between.
 *
 * The heading is left-aligned and set on the fluid display scale. The eyebrow
 * carries the town, because "where is this club" is the first thing a local
 * visitor is checking.
 */
export function Hero({
  site,
  hasVisit,
}: {
  site: PublicSite;
  /** Whether the "Visit us" secondary button has anywhere to go. */
  hasVisit: boolean;
}) {
  const cta = primaryCta(site);
  const hasPhoto = Boolean(text(site.hero_image_url));
  const place = formatAddress([site.city, site.region]);
  const tagline = text(site.tagline) ?? text(site.description);

  return (
    <section
      id="top"
      className="relative isolate flex min-h-[62vh] flex-col justify-end overflow-hidden border-b border-border md:min-h-[72vh]"
    >
      {hasPhoto ? (
        <SitePhoto
          absolute
          src={site.hero_image_url}
          alt=""
          sizes="100vw"
          preload
          overlay={<PhotoScrim />}
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-club-accent-soft"
        >
          <TargetMark className="absolute -right-16 -top-16 h-96 w-96 text-club-accent-text opacity-10" />
        </div>
      )}

      <div
        className={`relative mx-auto w-full max-w-6xl px-4 pb-14 pt-28 sm:px-6 md:pb-20 md:pt-40 ${
          hasPhoto ? "text-white" : "text-foreground"
        }`}
      >
        <div className="max-w-3xl">
          {place ? (
            <p
              className={`mb-3 text-sm font-semibold uppercase tracking-[0.14em] ${
                hasPhoto ? "text-white" : "text-muted-foreground"
              }`}
            >
              {place}
            </p>
          ) : null}
          <h1 className="text-club-display font-bold leading-[1.05] tracking-tight text-balance">
            {site.name}
          </h1>
          {tagline ? (
            <p
              className={`mt-5 max-w-2xl text-club-lede leading-relaxed text-pretty ${
                hasPhoto ? "text-white/90" : "text-muted-foreground"
              }`}
            >
              {tagline}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            {cta ? (
              <a
                href={cta.href}
                className={`${buttonAccent} px-7 py-3.5 text-base`}
              >
                {cta.label}
              </a>
            ) : null}
            {hasVisit ? (
              <a
                href="#visit"
                className={`${hasPhoto ? buttonOnImage : buttonAccentOutline} px-7 py-3.5 text-base`}
              >
                Visit us
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
