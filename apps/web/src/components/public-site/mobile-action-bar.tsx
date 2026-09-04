import { MapPinIcon, PhoneIcon } from "@/components/marketing/icons";
import {
  directionsHref,
  primaryAddress,
  primaryCta,
  text,
} from "@/components/public-site/lib";
import type { PublicSite } from "@/lib/public-site";

/**
 * A fixed action bar pinned to the bottom of the viewport on phones.
 *
 * Two ideas at once. The thumb reaches the bottom of a phone screen far more
 * easily than the top, so the actions that matter belong there rather than in a
 * header the visitor has to scroll back to (target distance / Fitts). And the
 * club's one goal stays visible for the whole scroll instead of only at the top
 * and bottom of the page (goal-gradient).
 *
 * Hidden on desktop, where the sticky header already holds the call to action.
 */
export function MobileActionBar({ site }: { site: PublicSite }) {
  const cta = primaryCta(site);
  const phone = text(site.phone);
  const directions = directionsHref(
    site.google_maps_url,
    site.latitude,
    site.longitude,
    primaryAddress(site),
  );

  const secondary = [
    phone
      ? { href: `tel:${phone}`, label: "Call", Icon: PhoneIcon, external: false }
      : null,
    directions
      ? { href: directions, label: "Directions", Icon: MapPinIcon, external: true }
      : null,
  ].filter((v) => v !== null);

  if (!cta && secondary.length === 0) return null;

  return (
    <>
      {/* Spacer so the bar never covers the end of the page. */}
      <div aria-hidden className="h-[76px] md:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <div className="flex items-center gap-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
          {secondary.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noreferrer" : undefined}
              className="club-tap flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-3 text-[11px] font-medium text-muted-foreground transition active:bg-muted"
            >
              <item.Icon className="h-5 w-5" />
              {item.label}
            </a>
          ))}
          {cta ? (
            <a
              href={cta.href}
              className="club-tap flex flex-1 items-center justify-center rounded-xl bg-club-accent px-5 text-sm font-semibold text-club-accent-contrast transition active:bg-club-accent-hover"
            >
              {cta.label}
            </a>
          ) : null}
        </div>
      </div>
    </>
  );
}
