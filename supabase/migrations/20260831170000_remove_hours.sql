-- Anchor — remove the hours feature from the public club sites.
--
-- Drops business_hours from the two public views. The base columns
-- (organizations.business_hours, locations.business_hours) are left in place but
-- deprecated/unused — nothing reads them anymore, and no new writes occur.

-- org_public_site without business_hours.
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
    and coalesce(o.site_published, true);

grant select on public.org_public_site to anon, authenticated;

-- location_public_site without business_hours.
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
    and coalesce(o.site_published, true);

grant select on public.location_public_site to anon, authenticated;
