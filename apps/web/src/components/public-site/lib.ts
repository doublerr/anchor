/**
 * Pure helpers shared across the public club-site template. Kept out of the
 * components so the sections stay presentational and the derivations (what the
 * nav shows, whether a section has anything worth rendering) live in one place.
 */
import type { PublicLocation, PublicSite, PublicTeamMember } from "@/lib/public-site";
import type { OrgMemberRole, SocialLinks } from "@/lib/org";

/** Public-facing labels for member roles shown in the Team section. */
export const ROLE_LABELS: Record<OrgMemberRole, string> = {
  admin: "Administrator",
  instructor: "Instructor",
  archer: "Archer", // never shown publicly; here for completeness
};

export const SOCIAL_LABELS: [keyof SocialLinks, string][] = [
  ["instagram", "Instagram"],
  ["facebook", "Facebook"],
  ["youtube", "YouTube"],
  ["tiktok", "TikTok"],
  ["x", "X"],
];

/** Join address parts into one line, dropping blanks. */
export function formatAddress(parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join(", ");
}

/** Non-empty array or null. */
export function list<T>(v: T[] | null | undefined): T[] | null {
  return v && v.length > 0 ? v : null;
}

/** Trimmed string or null — collapses the "present but blank" case. */
export function text(v: string | null | undefined): string | null {
  const t = v?.trim();
  return t ? t : null;
}

/**
 * A keyless Google Maps embed URL for a location — prefers coordinates, falls
 * back to the address string. `output=embed` needs no API key. Returns null
 * when there's nothing to locate.
 */
export function mapEmbedSrc(
  lat: number | null,
  lng: number | null,
  address: string,
): string | null {
  const q =
    lat != null && lng != null
      ? `${lat},${lng}`
      : address.trim()
        ? address.trim()
        : null;
  if (!q) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`;
}

/** A "get directions" link: the club's own maps URL, else a maps search. */
export function directionsHref(
  mapsUrl: string | null,
  lat: number | null,
  lng: number | null,
  address: string,
): string | null {
  if (mapsUrl) return mapsUrl;
  const q = lat != null && lng != null ? `${lat},${lng}` : address.trim();
  if (!q) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/** The club's single primary call to action, or null when it hasn't set one. */
export function primaryCta(
  site: PublicSite,
): { label: string; href: string } | null {
  const label = text(site.cta_label);
  const href = text(site.cta_url);
  return label && href ? { label, href } : null;
}

/** The club's own address as one line. */
export function primaryAddress(site: PublicSite): string {
  return formatAddress([
    site.address_line1,
    site.city,
    site.region,
    site.postal_code,
    site.country,
  ]);
}

/* ------------------------------ section gates ----------------------------- */

export function hasAbout(site: PublicSite): boolean {
  return Boolean(
    text(site.about) ||
      text(site.description) ||
      site.founded_year ||
      list(site.highlights) ||
      text(site.about_image_url),
  );
}

/** Whether the About sub-page has anything to show (drives the "learn more"). */
export function hasAboutPageContent(
  site: PublicSite,
  team: PublicTeamMember[],
): boolean {
  return Boolean(
    text(site.mission) ||
      text(site.method) ||
      text(site.facilities) ||
      team.length > 0,
  );
}

export function hasVisit(site: PublicSite, locations: PublicLocation[]): boolean {
  return Boolean(
    primaryAddress(site) ||
      site.google_maps_url ||
      locations.length > 0 ||
      text(site.email) ||
      text(site.phone) ||
      text(site.website) ||
      SOCIAL_LABELS.some(([k]) => text(site.social_links?.[k])),
  );
}

/* --------------------------------- nav ----------------------------------- */

/** A header nav entry: an in-page anchor, or an explicit `href` (a sub-page). */
export type NavItem = { id: string; label: string; href?: string };

/**
 * How many links the primary nav shows. Hick's Law: past roughly five choices
 * a visitor stops reading the bar and starts scanning it. Everything beyond the
 * cap is still reachable from the footer sitemap.
 */
export const NAV_LIMIT = 5;

/**
 * Every section a visitor can jump to, in priority order — most-asked question
 * first. About and Programs point at their dedicated sub-pages when those have
 * content, so the nav never sends someone to a thinner version of a page that
 * exists in full elsewhere.
 */
export function allNavSections(
  site: PublicSite,
  locations: PublicLocation[],
  team: PublicTeamMember[],
): NavItem[] {
  const hasAboutPage = hasAboutPageContent(site, team);
  const hasPrograms = Boolean(list(site.programs));
  const candidates: [boolean, string, string, string?][] = [
    [
      hasAbout(site) || hasAboutPage,
      "about",
      "About",
      hasAboutPage ? `/${site.slug}/about` : undefined,
    ],
    [
      hasPrograms,
      "programs",
      "Programs",
      hasPrograms ? `/${site.slug}/programs` : undefined,
    ],
    [hasVisit(site, locations), "visit", "Visit"],
    [Boolean(list(site.pricing)), "pricing", "Pricing"],
    [team.length > 0, "team", "Team"],
    [Boolean(list(site.gallery)), "gallery", "Gallery"],
    [Boolean(list(site.events)), "events", "Events"],
    // No "Schedule" entry: the schedule link lives inside Visit & contact,
    // next to the address and hours a visitor is already looking for.
    [Boolean(list(site.faqs)), "faq", "FAQ"],
  ];
  return candidates
    .filter(([present]) => present)
    .map(([, id, label, href]) => ({ id, label, href }));
}

/** The capped set shown in the header bar. */
export function primaryNav(all: NavItem[]): NavItem[] {
  return all.slice(0, NAV_LIMIT);
}
