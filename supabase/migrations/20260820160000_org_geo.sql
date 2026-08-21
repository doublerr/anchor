-- Anchor — geocoded address data from Google Places autocomplete.
--
-- The onboarding address inputs default to Google Places autocomplete. When a
-- place is picked we keep the parsed address (existing columns) plus its
-- coordinates and Google place id, on both the org's primary site and each
-- additional location. This lets us render maps later without re-geocoding and
-- auto-build the Google Maps link (google_maps_url) from the place id.

alter table public.organizations
  add column if not exists latitude        double precision,
  add column if not exists longitude       double precision,
  add column if not exists google_place_id text;

alter table public.locations
  add column if not exists latitude        double precision,
  add column if not exists longitude       double precision,
  add column if not exists google_place_id text;
