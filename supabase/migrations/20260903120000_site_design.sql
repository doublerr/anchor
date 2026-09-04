-- Anchor — image-forward redesign of the public club sites.
--
-- Two new columns and one data reshape:
--   accent_color     a named brand accent per club, so no two club sites look
--                    identical. A checked set rather than free hex, so every
--                    value is guaranteed to hold contrast in light and dark.
--   about_image_url  a photo beside the About copy (the split layout).
--   gallery          reshaped from a flat array of URL strings to
--                    [{ url, caption }] so gallery images can carry a caption.
--
-- The other new content lives inside existing jsonb columns as additive keys
-- (programs[].image_url, events[].image_url, pricing[].featured,
-- testimonials[].image_url / .role) and needs no DDL.

alter table public.organizations
  add column if not exists accent_color text,
  add column if not exists about_image_url text;

-- A closed set: the three brand accents plus two calmer options for clubs whose
-- own branding doesn't suit them. Null = fall back to gold.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'organizations_accent_color_check'
  ) then
    alter table public.organizations
      add constraint organizations_accent_color_check
      check (accent_color is null
             or accent_color in ('gold', 'aqua', 'coral', 'forest', 'slate'));
  end if;
end $$;

-- Backfill the gallery reshape: "https://…" -> { "url": "https://…", "caption": "" }.
-- Idempotent — rows already in object form are passed through untouched.
update public.organizations
   set gallery = (
     select jsonb_agg(
       case when jsonb_typeof(e) = 'string'
            then jsonb_build_object('url', e, 'caption', '')
            else e
       end
     )
     from jsonb_array_elements(gallery) e
   )
 where gallery is not null
   and jsonb_typeof(gallery) = 'array'
   and jsonb_array_length(gallery) > 0;

-- Recreate org_public_site with the two new columns exposed to public reads.
-- Definer-rights view (no security_invoker) — see 20260831120000_org_public_site.
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
    and coalesce(o.site_published, true);

grant select on public.org_public_site to anon, authenticated;
