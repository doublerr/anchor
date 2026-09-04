-- Anchor — hold a club's public URL dark until the page is worth visiting.
--
-- site_published defaults to true, so until now finishing onboarding put a live
-- public page into the world carrying nothing but the club's name. That is
-- worse for the club than having no page at all.
--
-- The gate lives in the views rather than in the app: the views are what `anon`
-- reads, so an unfinished site is invisible to the REST API, to the sitemap and
-- to static generation alike, no matter which code path asks. The matching
-- TypeScript definition is apps/web/src/lib/site-essentials.ts — the two must
-- be changed together.

create or replace function public.org_site_ready(
  p_hero_image_url text,
  p_tagline text,
  p_about text,
  p_description text,
  p_programs jsonb
) returns boolean
language sql
immutable
parallel safe
as $$
  -- CASE, not `and`, around the jsonb walk: Postgres does not promise
  -- short-circuit evaluation, and jsonb_array_elements() errors on a non-array.
  select coalesce(btrim(p_hero_image_url), '') <> ''
     and coalesce(btrim(p_tagline), '') <> ''
     -- The public About section falls back to `description`, so either will do.
     and (
       coalesce(btrim(p_about), '') <> ''
       or coalesce(btrim(p_description), '') <> ''
     )
     and case
           when jsonb_typeof(p_programs) = 'array' then exists (
             select 1
               from jsonb_array_elements(p_programs) e
              where coalesce(btrim(e ->> 'name'), '') <> ''
           )
           else false
         end;
$$;

comment on function public.org_site_ready(text, text, text, text, jsonb) is
  'Whether a club has provided the minimum content for its public page to be served. Mirrored in apps/web/src/lib/site-essentials.ts.';

grant execute on function public.org_site_ready(text, text, text, text, jsonb)
  to anon, authenticated;

-- Recreate the three anon-readable views with the readiness gate. All three
-- carry it: without it on the location and team views, an unfinished club would
-- still leak its addresses and its instructors' names and photos.

drop view if exists public.org_public_site;
create view public.org_public_site as
  select
    o.id,
    o.name,
    o.slug,
    o.tagline,
    o.description,
    o.about,
    o.mission,
    o.method,
    o.facilities,
    o.founded_year,
    o.highlights,
    o.logo_url,
    o.hero_image_url,
    o.about_image_url,
    o.accent_color,
    o.announcement,
    o.programs_intro,
    o.programs,
    o.schedule_url,
    o.pricing,
    o.events,
    o.testimonials,
    o.gallery,
    o.faqs,
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
    and coalesce(o.site_published, true)
    and public.org_site_ready(
          o.hero_image_url, o.tagline, o.about, o.description, o.programs
        );

grant select on public.org_public_site to anon, authenticated;

drop view if exists public.location_public_site;
create view public.location_public_site as
  select
    l.id,
    l.organization_id,
    l.name,
    l.address_line1,
    l.address_line2,
    l.city,
    l.region,
    l.postal_code,
    l.country,
    l.special_instructions,
    l.google_maps_url,
    l.latitude,
    l.longitude,
    l.created_at
  from public.locations l
  join public.organizations o on o.id = l.organization_id
  where o.onboarding_completed_at is not null
    and coalesce(o.site_published, true)
    and public.org_site_ready(
          o.hero_image_url, o.tagline, o.about, o.description, o.programs
        );

grant select on public.location_public_site to anon, authenticated;

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
    -- coalesce, matching 20260831130000: a member whose flag was never written
    -- is shown, and only an explicit false hides them.
    and coalesce(m.show_on_site, true)
    and public.org_site_ready(
          o.hero_image_url, o.tagline, o.about, o.description, o.programs
        );

grant select on public.team_public_site to anon, authenticated;
