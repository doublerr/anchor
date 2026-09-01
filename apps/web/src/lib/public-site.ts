import { createPublicClient } from "@/lib/supabase/public";
import { RESERVED_SLUGS, validateSlug } from "@/lib/slug";
import type {
  EventItem,
  Faq,
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
  announcement: string | null;
  programs_intro: string | null;
  programs: Program[] | null;
  schedule_url: string | null;
  pricing: PricingItem[] | null;
  events: EventItem[] | null;
  testimonials: Testimonial[] | null;
  gallery: string[] | null;
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
 * Load the published public site for a slug, or `null` when there is no
 * published, onboarded org at that slug. Reserved slugs never resolve to a
 * site. Reads go through the curated `org_public_site` / `location_public_site`
 * views, which are granted to `anon`, so this works without a session.
 */
export async function getPublicSite(
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

  return {
    site: site as PublicSite,
    locations: (locations as PublicLocation[]) ?? [],
    team: (team as PublicTeamMember[]) ?? [],
  };
}

/** All published club slugs, for static pre-rendering. */
export async function listPublishedSlugs(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("org_public_site").select("slug");
  return (data ?? []).map((r) => (r as { slug: string }).slug);
}
