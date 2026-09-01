import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Organization profile shape as stored in `public.organizations`. Everything
 * beyond `id`/`name` is filled in by the post-login onboarding wizard, so those
 * fields are nullable until onboarding completes.
 */
/** Which public URL a club uses as its primary address. */
export type UrlType = "anchor_path" | "anchor_subdomain" | "existing";

/** A member's role within an org (mirrors the `org_member_role` enum). */
export type OrgMemberRole = "admin" | "instructor" | "archer";

/** Roles eligible to appear on the public site — archers are never shown. */
export const PUBLIC_TEAM_ROLES = ["admin", "instructor"] as const;

/**
 * An eligible team member as seen by a managing admin (from the
 * `org_team_members` view): every admin/instructor of the org, with their
 * current public-visibility flag. Used to drive the site editor's Team picker.
 */
export type OrgTeamMember = {
  id: string;
  profile_id: string;
  member_role: OrgMemberRole;
  show_on_site: boolean;
  full_name: string | null;
  avatar_url: string | null;
};

/* --- Public-site content shapes (stored as jsonb on organizations) --------- */

/** A single stat tile in the About section, e.g. { value: "8,000+", label: "archers coached" }. */
export type Highlight = { value: string; label: string };

/** A program / class offering shown in the Programs section. */
export type Program = {
  name: string;
  audience: string;
  blurb: string;
  cta_label: string;
  cta_url: string;
};

/** A pricing / membership card. */
export type PricingItem = {
  name: string;
  price: string;
  cadence: string;
  note: string;
};

/** An upcoming event / clinic. */
export type EventItem = {
  title: string;
  date: string;
  blurb: string;
  url: string;
};

/** A testimonial / review. */
export type Testimonial = { quote: string; author: string };

/** A frequently asked question. */
export type Faq = { q: string; a: string };

/** Club social profiles; every key optional. */
export type SocialLinks = {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  x?: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  url_type: UrlType;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  contact_name: string | null;
  contact_title: string | null;
  website: string | null;
  description: string | null;
  logo_url: string | null;
  timezone: string | null;
  currency: string | null;
  /** Google Maps link for the primary site — we link out for hours/directions. */
  google_maps_url: string | null;
  latitude: number | null;
  longitude: number | null;
  google_place_id: string | null;
  onboarding_completed_at: string | null;

  /* --- Public-site content (all optional; edited from the /site editor) ---- */
  tagline: string | null;
  hero_image_url: string | null;
  announcement: string | null;
  cta_label: string | null;
  cta_url: string | null;
  about: string | null;
  mission: string | null;
  method: string | null;
  facilities: string | null;
  founded_year: number | null;
  highlights: Highlight[] | null;
  programs_intro: string | null;
  programs: Program[] | null;
  schedule_url: string | null;
  pricing: PricingItem[] | null;
  events: EventItem[] | null;
  testimonials: Testimonial[] | null;
  gallery: string[] | null;
  faqs: Faq[] | null;
  social_links: SocialLinks | null;
  site_published: boolean;
  site_completed_at: string | null;
};

/**
 * Columns selected for the admin org. Kept as a constant so the dashboard and
 * the site editor read the same shape. Includes the public-site content.
 */
export const ORG_SELECT =
  "id, name, slug, url_type, address_line1, address_line2, city, region, postal_code, country, phone, email, contact_name, contact_title, website, description, logo_url, timezone, currency, google_maps_url, latitude, longitude, google_place_id, onboarding_completed_at, tagline, hero_image_url, announcement, cta_label, cta_url, about, mission, method, facilities, founded_year, highlights, programs_intro, programs, schedule_url, pricing, events, testimonials, gallery, faqs, social_links, site_published, site_completed_at";

export type OrgOnboardingState = {
  org: Organization | null;
  /** True once the wizard has stamped `onboarding_completed_at`. */
  isComplete: boolean;
};

/**
 * Organization-profile fields the onboarding wizard requires before it will
 * stamp `onboarding_completed_at`. The hard gate keys off the stamp, but the
 * server action re-validates these so a partial POST can't slip through.
 */
export const REQUIRED_ORG_FIELDS = [
  "contact_name",
  "address_line1",
  "city",
  "region",
  "postal_code",
  "country",
  "phone",
] as const satisfies readonly (keyof Organization)[];

/**
 * The organization the given user administers, plus whether its onboarding is
 * complete. Returns `{ org: null }` when the user admins no org (e.g. a future
 * archer/guardian who never created one) — the gate treats that as "nothing to
 * onboard" and lets them through.
 *
 * RLS scopes the reads to the signed-in user, so the only org this can surface
 * is one the user is genuinely an admin of.
 */
export async function getAdminOrg(
  supabase: SupabaseClient,
  userId: string,
): Promise<OrgOnboardingState> {
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("profile_id", userId)
    .eq("member_role", "admin")
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return { org: null, isComplete: false };
  }

  const { data: org } = await supabase
    .from("organizations")
    .select(ORG_SELECT)
    .eq("id", membership.organization_id)
    .single();

  return {
    org: (org as Organization) ?? null,
    isComplete: Boolean(org?.onboarding_completed_at),
  };
}
