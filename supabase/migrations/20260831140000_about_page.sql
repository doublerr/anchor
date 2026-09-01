-- Anchor — dedicated About sub-page content (anchorplatforms.site/{slug}/about).
--
-- The home page keeps its short About blurb; a linked sub-page goes deeper with
-- four sections: Mission, Method, Facilities, and Team. Team reuses the existing
-- member-derived `team_public_site` view, so only three free-text fields are new.

alter table public.organizations
  add column if not exists mission    text,
  add column if not exists method     text,
  add column if not exists facilities text;

-- Recreate org_public_site with the new columns exposed to the public reads.
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
