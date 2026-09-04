import { MapPinIcon, PhoneIcon } from "@/components/marketing/icons";
import { buttonAccent, buttonAccentOutline } from "@/components/ui/button-styles";
import {
  directionsHref,
  primaryAddress,
  primaryCta,
  text,
} from "@/components/public-site/lib";
import type { PublicSite } from "@/lib/public-site";

/**
 * The closing block.
 *
 * Peak–End: people judge an experience by its most intense moment and its last
 * one, and the old page's last moment was a centered list of contact details
 * fading into a "Powered by Anchor" line. This ends the page on a deliberate
 * invitation instead, restating the club's own call to action one last time with
 * the address and phone right beside it — the same goal, now one tap away
 * (goal-gradient).
 */
export function ClosingCta({ site }: { site: PublicSite }) {
  const cta = primaryCta(site);
  const address = primaryAddress(site);
  const phone = text(site.phone);
  const directions = directionsHref(
    site.google_maps_url,
    site.latitude,
    site.longitude,
    address,
  );

  // Nothing to invite anyone to — don't end on an empty gesture.
  if (!cta && !address && !phone) return null;

  return (
    <section className="border-t border-border bg-club-accent-soft">
      <div className="mx-auto w-full max-w-4xl px-4 py-20 text-center sm:px-6 md:py-24">
        <h2 className="text-club-h1 font-bold tracking-tight text-balance text-foreground">
          Come shoot with us
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-club-lede leading-relaxed text-pretty text-muted-foreground">
          New archers are welcome at {site.name} — no gear or experience needed
          to get started.
        </p>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          {cta ? (
            <a href={cta.href} className={`${buttonAccent} px-7 py-3.5 text-base`}>
              {cta.label}
            </a>
          ) : null}
          {phone ? (
            <a
              href={`tel:${phone}`}
              className={`${buttonAccentOutline} px-7 py-3.5 text-base`}
            >
              <PhoneIcon className="h-4.5 w-4.5" />
              {phone}
            </a>
          ) : null}
        </div>

        {address ? (
          <p className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
            <MapPinIcon className="h-4 w-4 shrink-0" />
            <span>{address}</span>
            {directions ? (
              <a
                href={directions}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-club-accent-text underline-offset-4 hover:underline"
              >
                Get directions
              </a>
            ) : null}
          </p>
        ) : null}
      </div>
    </section>
  );
}
