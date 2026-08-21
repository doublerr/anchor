-- Anchor — rich organization profile + additional locations + logo storage.
--
-- Follow-up to the org signup flow (20260819120000 → 20260819150000). Signup
-- still creates a *bare* organization (name only) via handle_new_user; a new
-- post-login onboarding wizard then *enriches* that same row with contact,
-- address, web/branding, and operational details, records any additional
-- locations, and stamps `onboarding_completed_at`. A hard gate in the app
-- redirects admins whose org is not yet complete to the wizard.
--
-- No trigger change: the wizard writes via the existing "Admins can update
-- their organization" RLS policy. Written idempotently so it re-applies cleanly.

-- ---------------------------------------------------------------------------
-- organizations: profile columns (all nullable so existing bare rows stay valid)
-- ---------------------------------------------------------------------------

alter table public.organizations
  add column if not exists address_line1 text,
  add column if not exists address_line2 text,
  add column if not exists city          text,
  add column if not exists region        text,
  add column if not exists postal_code   text,
  add column if not exists country       text,
  add column if not exists phone         text,
  add column if not exists email         text,
  add column if not exists website       text,
  add column if not exists description   text,
  add column if not exists logo_url      text,
  add column if not exists timezone      text,
  add column if not exists currency      text,
  add column if not exists business_hours jsonb,
  add column if not exists onboarding_completed_at timestamptz;

-- ---------------------------------------------------------------------------
-- locations: *additional* sites for an org (the primary/HQ address lives on
-- organizations itself). Each has its own name, address, and free-text
-- directions ("special instructions to get there").
-- ---------------------------------------------------------------------------

create table if not exists public.locations (
  id                   uuid primary key default gen_random_uuid(),
  organization_id      uuid not null references public.organizations (id) on delete cascade,
  name                 text not null,
  address_line1        text,
  address_line2        text,
  city                 text,
  region               text,
  postal_code          text,
  country              text,
  special_instructions text,
  created_by           uuid not null references auth.users (id) on delete cascade,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists locations_organization_id_idx
  on public.locations (organization_id);

-- Keep updated_at fresh (reuses set_updated_at from the init migration).
drop trigger if exists locations_set_updated_at on public.locations;
create trigger locations_set_updated_at
  before update on public.locations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: members read their org's locations; admins manage them. Reuses the
-- security-definer helpers from 20260819120000_org_signup.
-- ---------------------------------------------------------------------------

alter table public.locations enable row level security;

drop policy if exists "Members can read org locations" on public.locations;
create policy "Members can read org locations"
  on public.locations for select to authenticated
  using (public.is_org_member(organization_id));

drop policy if exists "Admins manage org locations" on public.locations;
create policy "Admins manage org locations"
  on public.locations for all to authenticated
  using (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));

-- ---------------------------------------------------------------------------
-- Storage: public bucket for org logos. Path convention: "{org_id}/{filename}".
-- Public read (logos are shown in-app); authenticated users may write. Object
-- ownership is not org-scoped at the storage layer — the app only ever writes
-- under the admin's own org id, and the bucket holds nothing sensitive.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('org-logos', 'org-logos', true)
on conflict (id) do nothing;

drop policy if exists "Public read org logos" on storage.objects;
create policy "Public read org logos"
  on storage.objects for select
  using (bucket_id = 'org-logos');

drop policy if exists "Authenticated write org logos" on storage.objects;
create policy "Authenticated write org logos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'org-logos');

drop policy if exists "Authenticated update org logos" on storage.objects;
create policy "Authenticated update org logos"
  on storage.objects for update to authenticated
  using (bucket_id = 'org-logos')
  with check (bucket_id = 'org-logos');

drop policy if exists "Authenticated delete org logos" on storage.objects;
create policy "Authenticated delete org logos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'org-logos');
