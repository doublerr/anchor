import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Organization profile shape as stored in `public.organizations`. Everything
 * beyond `id`/`name` is filled in by the post-login onboarding wizard, so those
 * fields are nullable until onboarding completes.
 */
/** Which public URL a club uses as its primary address. */
export type UrlType = "anchor_path" | "anchor_subdomain" | "existing";

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
};

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
    .select(
      "id, name, slug, url_type, address_line1, address_line2, city, region, postal_code, country, phone, email, contact_name, contact_title, website, description, logo_url, timezone, currency, google_maps_url, latitude, longitude, google_place_id, onboarding_completed_at",
    )
    .eq("id", membership.organization_id)
    .single();

  return {
    org: (org as Organization) ?? null,
    isComplete: Boolean(org?.onboarding_completed_at),
  };
}
