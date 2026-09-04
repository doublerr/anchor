"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminOrg, isAccentColor, PUBLIC_TEAM_ROLES } from "@/lib/org";
import type {
  EventItem,
  Faq,
  GalleryImage,
  Highlight,
  PricingItem,
  Program,
  SocialLinks,
  Testimonial,
} from "@/lib/org";

/** The public-site content an admin edits from the /site editor. */
export type SiteContentPayload = {
  logo_url: string;
  tagline: string;
  hero_image_url: string;
  about_image_url: string;
  /** One of ACCENT_COLORS, or "" for the default. */
  accent_color: string;
  announcement: string;
  cta_label: string;
  cta_url: string;
  about: string;
  mission: string;
  method: string;
  facilities: string;
  founded_year: string; // form value; parsed to int (or null)
  highlights: Highlight[];
  programs_intro: string;
  programs: Program[];
  schedule_url: string;
  pricing: PricingItem[];
  events: EventItem[];
  testimonials: Testimonial[];
  gallery: GalleryImage[];
  faqs: Faq[];
  social_links: SocialLinks;
  site_published: boolean;
  /** organization_members.id values (admins/instructors) to show publicly. */
  visible_member_ids: string[];
};

export type SaveSiteResult = { error: string };

/** Trim to null when empty, else the trimmed string. */
function clean(value: string): string | null {
  const v = value?.trim();
  return v ? v : null;
}

/** Drop fully-empty rows so we don't persist blank cards. */
function pruneRows<T extends Record<string, unknown>>(rows: T[]): T[] | null {
  const kept = rows.filter((r) =>
    Object.values(r).some((v) => typeof v === "string" && v.trim()),
  );
  return kept.length > 0 ? kept : null;
}

/** Keep only non-empty social handles; null when none set. */
function pruneSocials(s: SocialLinks): SocialLinks | null {
  const out: SocialLinks = {};
  (Object.keys(s) as (keyof SocialLinks)[]).forEach((k) => {
    const v = s[k]?.trim();
    if (v) out[k] = v;
  });
  return Object.keys(out).length > 0 ? out : null;
}

/**
 * Save the signed-in admin's public-site content and stamp `site_completed_at`
 * (which flips step 2 of the dashboard setup checklist to done). Then revalidate
 * the public page so edits go live immediately.
 *
 * Security: the target org is derived from the session (never trusted from the
 * client) and the write goes through the admin-only RLS policy.
 */
export async function saveSite(
  payload: SiteContentPayload,
): Promise<SaveSiteResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { org } = await getAdminOrg(supabase, user.id);
  if (!org) {
    return { error: "No organization found for your account." };
  }

  const foundedYear = payload.founded_year.trim()
    ? Number.parseInt(payload.founded_year, 10)
    : null;
  if (foundedYear !== null && Number.isNaN(foundedYear)) {
    return { error: "Founded year must be a number (e.g. 1995)." };
  }

  // The accent drives CSS custom properties on the public page, and the column
  // has a matching check constraint — validate here so a bad value fails as a
  // readable message rather than a database error.
  const accent = payload.accent_color.trim();
  if (accent && !isAccentColor(accent)) {
    return { error: "That is not a valid accent color." };
  }

  // Drop gallery entries whose upload never completed; keep captions trimmed.
  const gallery = payload.gallery
    .filter((g) => g.url?.trim())
    .map((g) => ({ url: g.url.trim(), caption: g.caption?.trim() ?? "" }));

  const { error } = await supabase
    .from("organizations")
    .update({
      logo_url: clean(payload.logo_url),
      tagline: clean(payload.tagline),
      hero_image_url: clean(payload.hero_image_url),
      about_image_url: clean(payload.about_image_url),
      accent_color: accent || null,
      announcement: clean(payload.announcement),
      cta_label: clean(payload.cta_label),
      cta_url: clean(payload.cta_url),
      about: clean(payload.about),
      mission: clean(payload.mission),
      method: clean(payload.method),
      facilities: clean(payload.facilities),
      founded_year: foundedYear,
      highlights: pruneRows(payload.highlights),
      programs_intro: clean(payload.programs_intro),
      programs: pruneRows(payload.programs),
      schedule_url: clean(payload.schedule_url),
      pricing: pruneRows(payload.pricing),
      events: pruneRows(payload.events),
      testimonials: pruneRows(payload.testimonials),
      gallery: gallery.length > 0 ? gallery : null,
      faqs: pruneRows(payload.faqs),
      social_links: pruneSocials(payload.social_links),
      site_published: payload.site_published,
      site_completed_at: new Date().toISOString(),
    })
    .eq("id", org.id);

  if (error) {
    return { error: `Could not save your site: ${error.message}` };
  }

  // Team visibility: flip show_on_site on eligible members only (admins /
  // instructors — archers are never touched). Hide all, then show the selected.
  const roles = [...PUBLIC_TEAM_ROLES];
  const { error: hideErr } = await supabase
    .from("organization_members")
    .update({ show_on_site: false })
    .eq("organization_id", org.id)
    .in("member_role", roles);
  if (hideErr) {
    return { error: `Could not update team: ${hideErr.message}` };
  }
  if (payload.visible_member_ids.length > 0) {
    const { error: showErr } = await supabase
      .from("organization_members")
      .update({ show_on_site: true })
      .eq("organization_id", org.id)
      .in("member_role", roles)
      .in("id", payload.visible_member_ids);
    if (showErr) {
      return { error: `Could not update team: ${showErr.message}` };
    }
  }

  // Refresh the public page, its sub-pages, and the dashboard (checklist /
  // share panel state).
  revalidatePath(`/${org.slug}`);
  revalidatePath(`/${org.slug}/about`);
  revalidatePath(`/${org.slug}/programs`);
  revalidatePath("/dashboard");
  return { error: "" };
}
