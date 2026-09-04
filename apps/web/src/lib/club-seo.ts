/**
 * Search metadata and structured data for the public club sites.
 *
 * A club page's whole SEO job is local: someone types "archery lessons austin"
 * and this page should be an answer. Two things carry that, and neither of them
 * is hidden keyword text —
 *
 *  1. Real, visible copy that names the place. The title, the description, the
 *     Visit heading and the map caption all say the town, because a visitor
 *     wants to know it too. Text hidden purely for crawlers is a Google spam
 *     policy violation ("hidden text and links") and risks the whole domain,
 *     which here means every club on it, not just the one that did it.
 *  2. Structured data, which is the channel actually designed for this —
 *     machine-readable location, coordinates, contact details and offerings,
 *     with no user-visible surface at all.
 *
 * The only non-visible text this file's rendering counterparts add is genuine
 * accessible-name text on controls (the map facade), which is what `sr-only` is
 * for.
 */
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import type { PublicLocation, PublicSite } from "@/lib/public-site";

function text(v: string | null | undefined): string | null {
  const t = v?.trim();
  return t ? t : null;
}

/** "Austin, TX" — the town a visitor would search for, or null. */
export function cityRegion(site: PublicSite): string | null {
  return (
    [text(site.city), text(site.region)].filter(Boolean).join(", ") || null
  );
}

/**
 * "archery club in Austin, TX" — the phrase used in the title, the meta
 * description and the Visit section's own visible copy.
 */
export function clubPlacePhrase(site: PublicSite): string {
  const place = cityRegion(site);
  return place ? `archery club in ${place}` : "archery club";
}

/** The club's canonical absolute URL, optionally for a sub-page. */
export function clubUrl(site: PublicSite, path = ""): string {
  return `${SITE_URL}/${site.slug}${path}`;
}

/** Trim to a length search engines will actually render. */
function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

function metaDescription(site: PublicSite, prefix?: string): string {
  const place = cityRegion(site);
  const lead = place
    ? `${site.name} is an archery club in ${place}.`
    : `${site.name} is an archery club.`;
  const body =
    text(prefix) ??
    text(site.tagline) ??
    text(site.description) ??
    text(site.about) ??
    "Programs, schedule, and how to join.";
  return truncate(`${lead} ${body}`, 160);
}

/**
 * Metadata for a club page.
 *
 * The title is `absolute`, so it escapes the root layout's "%s · Anchor"
 * template. This is the club's own site — appending our brand both misrepresents
 * whose page it is and spends characters that the club's town should be using.
 */
export function clubMetadata(
  site: PublicSite,
  {
    path = "",
    title,
    description,
  }: { path?: string; title?: string; description?: string } = {},
): Metadata {
  const place = cityRegion(site);
  const resolvedTitle =
    title ??
    (place
      ? `${site.name} — Archery Club in ${place}`
      : `${site.name} — Archery Club`);
  const resolvedDescription = description ?? metaDescription(site);
  const url = clubUrl(site, path);
  const images = [site.hero_image_url, site.logo_url].filter(
    (v): v is string => Boolean(v),
  );

  return {
    title: { absolute: truncate(resolvedTitle, 60) },
    description: resolvedDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: site.name,
      title: resolvedTitle,
      description: resolvedDescription,
      images: images.length > 0 ? images : undefined,
    },
    twitter: {
      card: images.length > 0 ? "summary_large_image" : "summary",
      title: resolvedTitle,
      description: resolvedDescription,
      images: images.length > 0 ? images : undefined,
    },
  };
}

/* ----------------------------- structured data ---------------------------- */

type JsonLdNode = Record<string, unknown>;

function postalAddress(parts: {
  address_line1: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  country: string | null;
}): JsonLdNode | undefined {
  const address: JsonLdNode = { "@type": "PostalAddress" };
  if (parts.address_line1) address.streetAddress = parts.address_line1;
  if (parts.city) address.addressLocality = parts.city;
  if (parts.region) address.addressRegion = parts.region;
  if (parts.postal_code) address.postalCode = parts.postal_code;
  if (parts.country) address.addressCountry = parts.country;
  return Object.keys(address).length > 1 ? address : undefined;
}

function geo(lat: number | null, lng: number | null): JsonLdNode | undefined {
  if (lat == null || lng == null) return undefined;
  return { "@type": "GeoCoordinates", latitude: lat, longitude: lng };
}

/** Drop undefined values so the emitted JSON stays clean. */
function compact(node: JsonLdNode): JsonLdNode {
  return Object.fromEntries(
    Object.entries(node).filter(([, v]) => v !== undefined && v !== null),
  );
}

/**
 * `SportsActivityLocation` for the club, plus a node per additional location
 * and a `FAQPage` when the club has published FAQs.
 *
 * This is what puts a club into local results and map packs: the coordinates,
 * the postal address and the phone number in a form a crawler doesn't have to
 * infer from prose.
 */
export function clubStructuredData(
  site: PublicSite,
  locations: PublicLocation[],
): JsonLdNode {
  const id = clubUrl(site);
  const images = [site.hero_image_url, site.logo_url].filter(Boolean);
  const sameAs = [
    site.website,
    site.social_links?.facebook,
    site.social_links?.instagram,
    site.social_links?.youtube,
    site.social_links?.tiktok,
    site.social_links?.x,
  ].filter((v): v is string => Boolean(v?.trim()));

  const club = compact({
    "@type": "SportsActivityLocation",
    "@id": id,
    name: site.name,
    url: id,
    description: metaDescription(site),
    sport: "Archery",
    image: images.length > 0 ? images : undefined,
    logo: site.logo_url ?? undefined,
    telephone: text(site.phone) ?? undefined,
    email: text(site.email) ?? undefined,
    foundingDate: site.founded_year ? String(site.founded_year) : undefined,
    address: postalAddress(site),
    geo: geo(site.latitude, site.longitude),
    hasMap: text(site.google_maps_url) ?? undefined,
    areaServed: site.city
      ? { "@type": "City", name: site.city }
      : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    makesOffer: site.programs?.length
      ? site.programs
          .filter((p) => p.name?.trim())
          .map((p) =>
            compact({
              "@type": "Offer",
              itemOffered: compact({
                "@type": "Service",
                name: p.name,
                description: text(p.blurb) ?? undefined,
                audience: p.audience?.trim()
                  ? { "@type": "Audience", audienceType: p.audience }
                  : undefined,
              }),
            }),
          )
      : undefined,
  });

  const branches = locations.map((loc) =>
    compact({
      "@type": "SportsActivityLocation",
      "@id": `${id}#location-${loc.id}`,
      name: loc.name,
      sport: "Archery",
      branchOf: { "@id": id },
      address: postalAddress(loc),
      geo: geo(loc.latitude, loc.longitude),
      hasMap: text(loc.google_maps_url) ?? undefined,
    }),
  );

  const faqs = site.faqs?.filter((f) => f.q?.trim() && f.a?.trim()) ?? [];
  const faqPage =
    faqs.length > 0
      ? {
          "@type": "FAQPage",
          "@id": `${id}#faq`,
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  return {
    "@context": "https://schema.org",
    "@graph": [club, ...branches, ...(faqPage ? [faqPage] : [])],
  };
}
