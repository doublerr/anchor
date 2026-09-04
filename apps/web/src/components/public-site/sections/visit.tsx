import {
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  GlobeIcon,
} from "@/components/marketing/icons";
import { buttonAccent, buttonAccentOutline } from "@/components/ui/button-styles";
import { Card, Section } from "@/components/public-site/ui/section";
import { MapEmbed } from "@/components/public-site/ui/map-embed";
import {
  SOCIAL_LABELS,
  directionsHref,
  formatAddress,
  mapEmbedSrc,
  primaryAddress,
  text,
} from "@/components/public-site/lib";
import { cityRegion } from "@/lib/club-seo";
import type { PublicLocation, PublicSite } from "@/lib/public-site";

/**
 * Visit & contact.
 *
 * Previously "Visit us" and "Get in touch" were two separate sections with four
 * others between them, so the address lived in one place and the phone number in
 * another. They answer the same question — how do I actually reach this club —
 * and belong in one region (proximity). Directions sit directly beneath the
 * address they belong to rather than at the foot of the card.
 */
export function Visit({
  site,
  locations,
}: {
  site: PublicSite;
  locations: PublicLocation[];
}) {
  const address = primaryAddress(site);
  const hasPrimary = Boolean(address || site.google_maps_url);
  const contacts = contactRows(site);
  const socials = SOCIAL_LABELS.filter(([k]) => text(site.social_links?.[k]));
  const schedule = text(site.schedule_url);
  const place = cityRegion(site);

  if (!hasPrimary && locations.length === 0 && contacts.length === 0) return null;

  return (
    <Section
      id="visit"
      width="wide"
      eyebrow="Come see us"
      /*
       * The town goes in the heading and the lede, visibly. Someone searching
       * "archery club in Austin" and someone who just landed here want the same
       * sentence, so it is written for the reader and happens to be the phrase
       * that ranks — rather than hidden text behind the map, which Google
       * treats as a spam signal against the whole domain (and this domain
       * carries every club).
       */
      title={place ? `Visit us in ${place}` : "Visit & contact"}
      lede={
        place
          ? `${site.name} is an archery club in ${place}. Here's where to find us and how to get in touch.`
          : null
      }
    >
      <div className="grid gap-6 lg:grid-cols-5">
        {hasPrimary ? (
          <div className="lg:col-span-3">
            <LocationCard
              name={site.name}
              address={address}
              mapsUrl={site.google_maps_url}
              lat={site.latitude}
              lng={site.longitude}
              primary
            />
          </div>
        ) : null}

        <div
          className={`flex flex-col gap-6 ${hasPrimary ? "lg:col-span-2" : "lg:col-span-5"}`}
        >
          {contacts.length > 0 ? (
            <Card className="p-2">
              <h3 className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Get in touch
              </h3>
              <ul>
                {contacts.map((row) => (
                  <li key={row.href}>
                    <a
                      href={row.href}
                      target={row.external ? "_blank" : undefined}
                      rel={row.external ? "noreferrer" : undefined}
                      className="club-tap flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-club-accent"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-club-accent-soft text-club-accent-text">
                        <row.Icon className="h-4.5 w-4.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs text-muted-foreground">
                          {row.label}
                        </span>
                        <span className="block truncate text-sm font-medium text-foreground">
                          {row.value}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              {site.contact_name ? (
                <p className="px-4 pb-3 pt-2 text-xs text-muted-foreground">
                  Ask for {site.contact_name}
                  {site.contact_title ? `, ${site.contact_title}` : ""}
                </p>
              ) : null}
            </Card>
          ) : null}

          {schedule ? (
            <Card className="p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-club-accent-soft text-club-accent-text">
                <ClockIcon className="h-4.5 w-4.5" />
              </span>
              <h3 className="mt-3 text-club-h3 font-semibold tracking-tight text-foreground">
                Classes &amp; open range
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                See what&rsquo;s running this week and when the range is open.
              </p>
              <a
                href={schedule}
                className={`${buttonAccentOutline} mt-4 w-full px-4 py-2.5 text-sm`}
              >
                View the schedule
              </a>
            </Card>
          ) : null}

          {socials.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {socials.map(([k, label]) => (
                <a
                  key={k}
                  href={site.social_links?.[k]}
                  target="_blank"
                  rel="noreferrer"
                  className="club-tap inline-flex items-center rounded-full border border-border px-4 text-sm font-medium text-foreground transition hover:border-club-accent hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-club-accent"
                >
                  {label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {locations.length > 0 ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {locations.map((loc) => (
            <LocationCard
              key={loc.id}
              name={loc.name}
              address={formatAddress([
                loc.address_line1,
                loc.city,
                loc.region,
                loc.postal_code,
                loc.country,
              ])}
              mapsUrl={loc.google_maps_url}
              instructions={loc.special_instructions}
              lat={loc.latitude}
              lng={loc.longitude}
            />
          ))}
        </div>
      ) : null}
    </Section>
  );
}

function LocationCard({
  name,
  address,
  mapsUrl,
  instructions,
  lat,
  lng,
  primary = false,
}: {
  name: string;
  address: string;
  mapsUrl: string | null;
  instructions?: string | null;
  lat: number | null;
  lng: number | null;
  primary?: boolean;
}) {
  const embed = mapEmbedSrc(lat, lng, address);
  const directions = directionsHref(mapsUrl, lat, lng, address);

  return (
    <Card className="flex h-full flex-col">
      {embed ? (
        <MapEmbed src={embed} title={`Map of ${name}`} place={address} />
      ) : null}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-club-accent-soft text-club-accent-text">
            <MapPinIcon className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <h3 className="flex flex-wrap items-center gap-2 text-club-h3 font-semibold tracking-tight text-foreground">
              {name}
              {primary ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Main location
                </span>
              ) : null}
            </h3>
            {address ? (
              <address className="mt-1 text-sm not-italic leading-relaxed text-muted-foreground">
                {address}
              </address>
            ) : null}
          </div>
        </div>
        {instructions ? (
          <p className="mt-4 rounded-xl bg-muted/60 p-4 text-sm leading-relaxed text-muted-foreground">
            {instructions}
          </p>
        ) : null}
        {directions ? (
          <a
            href={directions}
            target="_blank"
            rel="noreferrer"
            className={`${primary ? buttonAccent : buttonAccentOutline} mt-5 w-full px-4 py-2.5 text-sm sm:w-auto sm:self-start sm:px-5`}
          >
            Get directions
          </a>
        ) : null}
      </div>
    </Card>
  );
}

/** The contact methods the club has published, most-actionable first. */
function contactRows(site: PublicSite) {
  const rows: {
    href: string;
    label: string;
    value: string;
    Icon: typeof PhoneIcon;
    external?: boolean;
  }[] = [];
  const phone = text(site.phone);
  const email = text(site.email);
  const website = text(site.website);
  if (phone) {
    rows.push({ href: `tel:${phone}`, label: "Phone", value: phone, Icon: PhoneIcon });
  }
  if (email) {
    rows.push({ href: `mailto:${email}`, label: "Email", value: email, Icon: MailIcon });
  }
  if (website) {
    rows.push({
      href: website,
      label: "Website",
      value: website.replace(/^https?:\/\//, ""),
      Icon: GlobeIcon,
      external: true,
    });
  }
  return rows;
}
