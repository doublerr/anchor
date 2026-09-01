-- Anchor — public club sites (anchorplatforms.site/{slug}).
--
-- Every onboarded org gets a single standard-design public page rendered from
-- its own data. This migration (1) adds the content columns that back the page
-- and are edited from a post-onboarding site editor, and (2) exposes a curated,
-- anon-readable read surface so the public route can render without a session.
--
-- Security: the base tables stay membership-gated (no anon policy is added).
-- Instead we grant SELECT on two whitelisting VIEWS owned by postgres, which
-- run with definer rights and therefore bypass base-table RLS while exposing
-- only safe columns for orgs that have finished onboarding AND left their site
-- published. Written idempotently so it re-applies cleanly.

-- ---------------------------------------------------------------------------
-- organizations: public-site content columns (all nullable). `business_hours`
-- was added in 20260820120000 then dropped in 20260820150000 — re-add it here.
-- ---------------------------------------------------------------------------

alter table public.organizations
  add column if not exists tagline           text,
  add column if not exists hero_image_url    text,
  add column if not exists announcement      text,
  add column if not exists cta_label         text,
  add column if not exists cta_url           text,
  add column if not exists about             text,
  add column if not exists founded_year      int,
  add column if not exists highlights        jsonb,
  add column if not exists coaches           jsonb,
  add column if not exists programs          jsonb,
  add column if not exists schedule_url      text,
  add column if not exists pricing           jsonb,
  add column if not exists events            jsonb,
  add column if not exists testimonials      jsonb,
  add column if not exists gallery           jsonb,
  add column if not exists faqs              jsonb,
  add column if not exists business_hours    jsonb,
  add column if not exists social_links      jsonb,
  add column if not exists site_published    boolean not null default true,
  add column if not exists site_completed_at timestamptz;

-- Satellite sites can carry their own hours.
alter table public.locations
  add column if not exists business_hours jsonb;

-- ---------------------------------------------------------------------------
-- Curated public read surface. These views whitelist the columns safe to show
-- on a public page and filter to published, onboarded orgs. Internal columns
-- (created_by, timezone, currency, url_type, google_place_id,
-- onboarding_completed_at, site flags) are deliberately excluded.
--
-- security_invoker is left OFF (default) so the view runs as its owner
-- (postgres) and bypasses the base-table RLS — access is controlled entirely by
-- the GRANTs below plus the WHERE clause. Base tables are NOT granted to anon.
-- ---------------------------------------------------------------------------

create or replace view public.org_public_site as
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
    o.coaches,
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

create or replace view public.location_public_site as
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
    l.business_hours,
    l.google_maps_url,
    l.latitude,
    l.longitude,
    l.created_at
  from public.locations l
  join public.organizations o on o.id = l.organization_id
  where o.onboarding_completed_at is not null
    and coalesce(o.site_published, true);

-- Expose the curated views (and only these) to unauthenticated + signed-in reads.
grant select on public.org_public_site to anon, authenticated;
grant select on public.location_public_site to anon, authenticated;
