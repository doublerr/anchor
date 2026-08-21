-- Anchor — defer hours/directions to Google Maps, per site.
--
-- Instead of a manual per-day hours editor, each site (the org's primary
-- location and every additional `locations` row) can carry a Google Maps link.
-- We don't import anything from it — the app just links out to Maps for hours
-- and directions. Hours are therefore inherently site-by-site.
--
-- The old org-wide `business_hours` jsonb (20260820120000) is dropped: it's
-- superseded by the Maps link and was never surfaced beyond the wizard.

alter table public.organizations
  add column if not exists google_maps_url text,
  drop column if exists business_hours;

alter table public.locations
  add column if not exists google_maps_url text;
