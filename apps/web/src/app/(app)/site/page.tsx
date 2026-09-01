import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminOrg, type OrgTeamMember } from "@/lib/org";
import { SiteEditor } from "@/components/site-editor/site-editor";
import type { SiteContentPayload } from "@/app/(app)/site/actions";

export const metadata = {
  title: "Public site · Anchor",
};

export default async function SitePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { org } = await getAdminOrg(supabase, user.id);
  // The (app) layout gate guarantees a completed org; guard defensively.
  if (!org) redirect("/create-organization");

  // Eligible team members (admins/instructors) for the public-site Team picker.
  const { data: teamRows } = await supabase
    .from("org_team_members")
    .select("id, profile_id, member_role, show_on_site, full_name, avatar_url")
    .eq("organization_id", org.id)
    .order("member_role", { ascending: true })
    .order("full_name", { ascending: true });
  const teamMembers = (teamRows as OrgTeamMember[]) ?? [];

  const initial: SiteContentPayload = {
    logo_url: org.logo_url ?? "",
    tagline: org.tagline ?? "",
    hero_image_url: org.hero_image_url ?? "",
    announcement: org.announcement ?? "",
    cta_label: org.cta_label ?? "",
    cta_url: org.cta_url ?? "",
    about: org.about ?? "",
    mission: org.mission ?? "",
    method: org.method ?? "",
    facilities: org.facilities ?? "",
    founded_year: org.founded_year != null ? String(org.founded_year) : "",
    highlights: org.highlights ?? [],
    programs_intro: org.programs_intro ?? "",
    programs: org.programs ?? [],
    schedule_url: org.schedule_url ?? "",
    pricing: org.pricing ?? [],
    events: org.events ?? [],
    testimonials: org.testimonials ?? [],
    gallery: org.gallery ?? [],
    faqs: org.faqs ?? [],
    social_links: org.social_links ?? {},
    site_published: org.site_published,
    visible_member_ids: teamMembers.filter((m) => m.show_on_site).map((m) => m.id),
  };

  return (
    <SiteEditor
      orgId={org.id}
      slug={org.slug}
      initial={initial}
      teamMembers={teamMembers}
    />
  );
}
