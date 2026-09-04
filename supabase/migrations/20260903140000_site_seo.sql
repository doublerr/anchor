-- Anchor — expose organizations.updated_at on the public site view.
--
-- The sitemap needs a <lastmod> per club page. `updated_at` is maintained by
-- the organizations_set_updated_at trigger (20260819120000) and says nothing
-- private — it is the modification time of content that is already public.

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
    o.longitude,
    o.updated_at
  from public.organizations o
  where o.onboarding_completed_at is not null
    and coalesce(o.site_published, true)
    and public.org_site_ready(
          o.hero_image_url, o.tagline, o.about, o.description, o.programs
        );

grant select on public.org_public_site to anon, authenticated;
