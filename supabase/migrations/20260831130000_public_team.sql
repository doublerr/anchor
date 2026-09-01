-- Anchor — public "team" section derived from org members (not free-form).
--
-- Replaces the free-form `organizations.coaches` list with the club's actual
-- members: admins and instructors can be shown on the public site; archers can
-- never be shown or promoted. Each eligible member has a `show_on_site` flag
-- (default true = "enabled by default"); admins pick who appears from the site
-- editor.
--
-- Two postgres-owned views expose member names/avatars past the owner-only
-- profiles RLS: one for anon (published team) and one for the managing admin
-- (the full eligible list, gated by is_org_admin). The old `coaches` column is
-- left in place but deprecated/unused.

-- Per-member public visibility. Default true so newly added instructors/admins
-- appear automatically; archers are excluded by the views regardless.
alter table public.organization_members
  add column if not exists show_on_site boolean not null default true;

-- ---------------------------------------------------------------------------
-- Recreate org_public_site WITHOUT the deprecated `coaches` column. (Postgres
-- only lets CREATE OR REPLACE VIEW append columns, so drop first.)
-- ---------------------------------------------------------------------------
drop view if exists public.org_public_site;
create view public.org_public_site as
  select
    o.id,
    o.name,
    o.slug,
    o.tagline,
    o.description,
    o.about,
    o.founded_year,
    o.highlights,
    o.logo_url,
    o.hero_image_url,
    o.announcement,
    o.programs,
    o.schedule_url,
    o.pricing,
    o.events,
    o.testimonials,
    o.gallery,
    o.faqs,
    o.business_hours,
    o.social_links,
    o.cta_label,
    o.cta_url,
    o.website,
    o.email,
    o.phone,
    o.contact_name,
    o.contact_title,
    o.address_line1,
    o.address_line2,
    o.city,
    o.region,
    o.postal_code,
    o.country,
    o.google_maps_url,
    o.latitude,
    o.longitude
  from public.organizations o
  where o.onboarding_completed_at is not null
    and coalesce(o.site_published, true);

grant select on public.org_public_site to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Public team: admins + instructors an org chose to show, for published orgs.
-- Owned by postgres so it can read profile names/avatars past profiles' RLS.
-- ---------------------------------------------------------------------------
drop view if exists public.team_public_site;
create view public.team_public_site as
  select
    m.organization_id,
    m.profile_id,
    m.member_role,
    p.full_name,
    p.avatar_url,
    m.created_at
  from public.organization_members m
  join public.profiles p on p.id = m.profile_id
  join public.organizations o on o.id = m.organization_id
  where o.onboarding_completed_at is not null
    and coalesce(o.site_published, true)
    and m.member_role in ('admin', 'instructor')
    and coalesce(m.show_on_site, true);

grant select on public.team_public_site to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Admin management view: every eligible member (admin/instructor) of an org the
-- current user administers, with its current show_on_site flag. Gated by
-- is_org_admin so non-admins get no rows even though the view bypasses RLS.
-- ---------------------------------------------------------------------------
drop view if exists public.org_team_members;
create view public.org_team_members as
  select
    m.id,
    m.organization_id,
    m.profile_id,
    m.member_role,
    coalesce(m.show_on_site, true) as show_on_site,
    p.full_name,
    p.avatar_url
  from public.organization_members m
  join public.profiles p on p.id = m.profile_id
  where m.member_role in ('admin', 'instructor')
    and public.is_org_admin(m.organization_id);

grant select on public.org_team_members to authenticated;
