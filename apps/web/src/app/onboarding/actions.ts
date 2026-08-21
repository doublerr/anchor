"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getAdminOrg,
  REQUIRED_ORG_FIELDS,
  type UrlType,
} from "@/lib/org";
import { validateOrgName, validateSlug } from "@/lib/slug";

export type LocationInput = {
  name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
  special_instructions: string;
  google_maps_url: string;
  latitude: number | null;
  longitude: number | null;
  google_place_id: string;
};

export type OnboardingPayload = {
  name: string;
  slug: string;
  url_type: UrlType;
  description: string;
  website: string;
  logo_url: string;
  address_line1: string;
  address_line2: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
  contact_name: string;
  contact_title: string;
  timezone: string;
  currency: string;
  google_maps_url: string;
  latitude: number | null;
  longitude: number | null;
  google_place_id: string;
  locations: LocationInput[];
};

export type OnboardingResult = { error: string };

/** Trim a value to null when empty, else the trimmed string. */
function clean(value: string): string | null {
  const v = value?.trim();
  return v ? v : null;
}

/**
 * Complete the signed-in admin's organization onboarding: enrich the existing
 * org row, replace its additional locations, and stamp
 * `onboarding_completed_at` so the hard gate lets them into the portal.
 *
 * Security: the target org is derived from the session (never trusted from the
 * client), and every write goes through the admin-only RLS policies.
 */
export async function completeOnboarding(
  payload: OnboardingPayload,
): Promise<OnboardingResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { org } = await getAdminOrg(supabase, user.id);
  if (!org) {
    return { error: "No organization found for your account." };
  }

  // Validate required profile fields before we stamp completion.
  const missing: string[] = REQUIRED_ORG_FIELDS.filter(
    (f) => !clean(String(payload[f as keyof OnboardingPayload] ?? "")),
  );
  const name = clean(payload.name);
  if (!name) missing.push("name");
  if (missing.length > 0) {
    return { error: `Please fill in all required fields: ${missing.join(", ")}.` };
  }

  const nameError = validateOrgName(payload.name);
  if (nameError) return { error: nameError };

  // Slug is the org's URL identifier — it always exists (generated at signup)
  // and is shown under the Anchor URL tab regardless of choice, so validate it
  // unconditionally. The DB unique index is the final authority on collisions.
  const slug = (payload.slug ?? "").trim().toLowerCase();
  const slugError = validateSlug(slug);
  if (slugError) return { error: slugError };

  // The subdomain option is a locked paid feature — reject it defensively.
  const urlType: UrlType =
    payload.url_type === "existing" ? "existing" : "anchor_path";
  const website = clean(payload.website);
  if (urlType === "existing" && !website) {
    return { error: "Enter your existing website URL, or choose an Anchor URL." };
  }

  const { error: orgError } = await supabase
    .from("organizations")
    .update({
      name,
      slug,
      url_type: urlType,
      description: clean(payload.description),
      website,
      logo_url: clean(payload.logo_url),
      address_line1: clean(payload.address_line1),
      address_line2: clean(payload.address_line2),
      city: clean(payload.city),
      region: clean(payload.region),
      postal_code: clean(payload.postal_code),
      country: clean(payload.country),
      phone: clean(payload.phone),
      email: clean(payload.email),
      contact_name: clean(payload.contact_name),
      contact_title: clean(payload.contact_title),
      timezone: clean(payload.timezone),
      currency: clean(payload.currency),
      google_maps_url: clean(payload.google_maps_url),
      latitude: payload.latitude,
      longitude: payload.longitude,
      google_place_id: clean(payload.google_place_id),
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", org.id);

  if (orgError) {
    // Unique-violation on the slug index -> the URL is already taken.
    if (orgError.code === "23505") {
      return { error: `The URL “${slug}” is already taken. Try another.` };
    }
    return { error: `Could not save your organization: ${orgError.message}` };
  }

  // Replace additional locations: clear then re-insert the non-empty rows. This
  // keeps the action idempotent if onboarding is ever re-run.
  const { error: delError } = await supabase
    .from("locations")
    .delete()
    .eq("organization_id", org.id);
  if (delError) {
    return { error: `Could not update locations: ${delError.message}` };
  }

  const rows = payload.locations
    .filter((l) => clean(l.name))
    .map((l) => ({
      organization_id: org.id,
      created_by: user.id,
      name: clean(l.name)!,
      address_line1: clean(l.address_line1),
      address_line2: clean(l.address_line2),
      city: clean(l.city),
      region: clean(l.region),
      postal_code: clean(l.postal_code),
      country: clean(l.country),
      special_instructions: clean(l.special_instructions),
      google_maps_url: clean(l.google_maps_url),
      latitude: l.latitude,
      longitude: l.longitude,
      google_place_id: clean(l.google_place_id),
    }));

  if (rows.length > 0) {
    const { error: insError } = await supabase.from("locations").insert(rows);
    if (insError) {
      return { error: `Could not save locations: ${insError.message}` };
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
