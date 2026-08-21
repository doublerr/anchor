-- Anchor — organization primary-URL preference.
--
-- The onboarding "Club URL" chooser offers three ways for a club's public page
-- to be reached, so we record which one is primary:
--   * anchor_path      — anchorplatforms.site/{slug}   (default, free)
--   * anchor_subdomain — {slug}.anchorplatforms.site   (paid, locked in UI)
--   * existing         — the club's own website (organizations.website)
--
-- The `slug` (20260820130000) still exists on every org regardless of choice;
-- this just captures the preferred public address for the future URL feature.

alter table public.organizations
  add column if not exists url_type text not null default 'anchor_path';

alter table public.organizations
  drop constraint if exists organizations_url_type_check;

alter table public.organizations
  add constraint organizations_url_type_check
  check (url_type in ('anchor_path', 'anchor_subdomain', 'existing'));
