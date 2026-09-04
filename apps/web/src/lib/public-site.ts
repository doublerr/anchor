import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { RESERVED_SLUGS, validateSlug } from "@/lib/slug";
import { isAccentColor } from "@/lib/org";
import type {
  AccentColor,
  EventItem,
  Faq,
  GalleryImage,
  Highlight,
  OrgMemberRole,
  PricingItem,
  Program,
  SocialLinks,
  Testimonial,
} from "@/lib/org";

/**
 * A club's public-site record, as exposed by the anon-readable
 * `org_public_site` view (a whitelisted, published-only projection of
 * `organizations`). Contains only columns safe to render on a public page.
 */
export type PublicSite = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  about: string | null;
  mission: string | null;
  method: string | null;
  facilities: string | null;
  founded_year: number | null;
  highlights: Highlight[] | null;
  logo_url: string | null;
  hero_image_url: string | null;
  about_image_url: string | null;
  accent_color: AccentColor | null;
  announcement: string | null;
  programs_intro: string | null;
  programs: Program[] | null;
  schedule_url: string | null;
  pricing: PricingItem[] | null;
  events: EventItem[] | null;
  testimonials: Testimonial[] | null;
  gallery: GalleryImage[] | null;
  faqs: Faq[] | null;
  social_links: SocialLinks | null;
  cta_label: string | null;
  cta_url: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  contact_name: string | null;
  contact_title: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  country: string | null;
  google_maps_url: string | null;
  latitude: number | null;
  longitude: number | null;
  updated_at: string | null;
};

/** An additional location for a public club site. */
export type PublicLocation = {
  id: string;
  organization_id: string;
  name: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  country: string | null;
  special_instructions: string | null;
  google_maps_url: string | null;
  latitude: number | null;
  longitude: number | null;
};

/** A publicly-shown team member (admin/instructor) for a club site. */
export type PublicTeamMember = {
  profile_id: string;
  full_name: string | null;
  member_role: OrgMemberRole;
  avatar_url: string | null;
};

export type PublicSiteData = {
  site: PublicSite;
  locations: PublicLocation[];
  team: PublicTeamMember[];
};

/**
 * Coerce a stored gallery into `{ url, caption }[]`.
 *
 * The column used to hold a flat array of URL strings. The migration reshapes
 * existing rows, but a row written by an older deploy (or a client that hasn't
 * picked up the new editor) can still arrive in the legacy shape — so read
 * tolerantly rather than rendering a broken grid.
 */
function normalizeGallery(raw: unknown): GalleryImage[] | null {
  if (!Array.isArray(raw)) return null;
  const items = raw
    .map((entry): GalleryImage | null => {
      if (typeof entry === "string") return { url: entry, caption: "" };
      if (entry && typeof entry === "object") {
        const { url, caption } = entry as Partial<GalleryImage>;
        if (typeof url === "string" && url.trim()) {
          return { url, caption: typeof caption === "string" ? caption : "" };
        }
      }
      return null;
    })
    .filter((v): v is GalleryImage => v !== null);
  return items.length > 0 ? items : null;
}

/**
 * Load the published public site for a slug, or `null` when there is no
 * published, onboarded org at that slug. Reserved slugs never resolve to a
 * site. Reads go through the curated `org_public_site` / `location_public_site`
 * views, which are granted to `anon`, so this works without a session.
 *
 * Wrapped in React `cache()` so the club layout (which needs the accent color)
 * and the page beneath it share a single round-trip per render.
 */
export const getPublicSite = cache(async function getPublicSite(
  slug: string,
): Promise<PublicSiteData | null> {
  const normalized = slug.trim().toLowerCase();
  if (RESERVED_SLUGS.has(normalized)) return null;
  if (validateSlug(normalized)) return null; // malformed slug -> no site

  const supabase = createPublicClient();

  const { data: site } = await supabase
    .from("org_public_site")
    .select("*")
    .eq("slug", normalized)
    .maybeSingle();

  if (!site) return null;

  const orgId = (site as PublicSite).id;

  const [{ data: locations }, { data: team }] = await Promise.all([
    supabase
      .from("location_public_site")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: true }),
    supabase
      .from("team_public_site")
      .select("profile_id, full_name, member_role, avatar_url")
      .eq("organization_id", orgId)
      // Admins before instructors (enum order), then by name.
      .order("member_role", { ascending: true })
      .order("full_name", { ascending: true }),
  ]);

  const record = site as PublicSite;

  return {
    site: {
      ...record,
      gallery: normalizeGallery(record.gallery),
      // Guard against a value predating the check constraint.
      accent_color: isAccentColor(record.accent_color)
        ? record.accent_color
        : null,
    },
    locations: (locations as PublicLocation[]) ?? [],
    team: (team as PublicTeamMember[]) ?? [],
  };
});

/** All published club slugs, for static pre-rendering. */
export async function listPublishedSlugs(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("org_public_site").select("slug");
  return (data ?? []).map((r) => (r as { slug: string }).slug);
}

/** One club's entry in the sitemap, with which sub-pages are worth listing. */
export type SitemapSite = {
  slug: string;
  lastModified: Date;
  hasAboutPage: boolean;
  hasProgramsPage: boolean;
};

/**
 * Every published club, for the sitemap.
 *
 * Sub-pages are listed only when they hold real content. `/{slug}/about`
 * renders whether or not the club filled in Mission/Method/Facilities, and
 * submitting a page that is a heading and a call to action invites a
 * thin-content judgement against the whole domain rather than helping the club.
 * The nav still links them, so nothing becomes unreachable.
 */
export async function listSitemapSites(): Promise<SitemapSite[]> {
  const supabase = createPublicClient();

  type Row = Partial<
    Pick<
      PublicSite,
      "updated_at" | "mission" | "method" | "facilities" | "programs"
    >
  > &
    Pick<PublicSite, "slug">;

  const full = await supabase
    .from("org_public_site")
    .select("slug, updated_at, mission, method, facilities, programs");

  // `updated_at` arrived in a later migration than the view itself. If it isn't
  // there yet, still list every club — a sitemap without <lastmod> is worth far
  // more than one that silently drops back to the marketing page alone.
  const { data } = full.error
    ? await supabase.from("org_public_site").select("slug")
    : full;

  return ((data as Row[]) ?? []).map((row) => ({
    slug: row.slug,
    lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
    hasAboutPage: Boolean(
      row.mission?.trim() || row.method?.trim() || row.facilities?.trim(),
    ),
    hasProgramsPage: Boolean(row.programs && row.programs.length > 0),
  }));
}
