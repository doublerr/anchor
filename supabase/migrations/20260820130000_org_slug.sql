-- Anchor — URL-safe organization slugs.
--
-- Orgs will get default URLs later, both as a path segment (/{slug}) and
-- eventually a subdomain ({slug}.…). Subdomains must be valid DNS labels, so a
-- slug is constrained to: 3–63 chars, lowercase a–z / 0–9 / hyphen, no leading,
-- trailing, or doubled hyphen. The human-readable `name` stays free-form (with
-- length limits enforced in the app); `slug` is the URL identifier.
--
-- Every org gets a slug at creation (generated in handle_new_user from the
-- name), and existing rows are backfilled. Uniqueness + format are enforced by
-- a unique index and a CHECK so bad data can't land regardless of entry point.

-- ---------------------------------------------------------------------------
-- slugify(text): name -> a valid DNS-label slug (3–63 chars). Falls back to a
-- random 'club-xxxxxx' when the input has too few usable characters.
-- ---------------------------------------------------------------------------

create or replace function public.slugify(txt text)
returns text
language plpgsql
set search_path = ''
as $$
declare
  s text;
begin
  s := lower(coalesce(txt, ''));
  s := regexp_replace(s, '[^a-z0-9]+', '-', 'g'); -- non-alnum runs -> single hyphen
  s := regexp_replace(s, '-+', '-', 'g');         -- collapse repeats
  s := trim(both '-' from s);
  s := left(s, 63);
  s := trim(both '-' from s);                      -- truncation may leave a trailing hyphen
  if char_length(s) < 3 then
    s := 'club-' || substr(md5(random()::text), 1, 6);
  end if;
  return s;
end;
$$;

-- Reserved slugs that must never be handed to an org (routing / infra names).
create or replace function public.reserved_slugs()
returns text[]
language sql
immutable
set search_path = ''
as $$
  select array[
    'www','app','admin','api','auth','login','signup','onboarding','dashboard',
    'settings','members','locations','account','billing','mail','ftp','blog',
    'help','support','status','staging','dev','test','assets','static','cdn',
    'root','anchor','about','pricing','terms','privacy'
  ];
$$;

-- ---------------------------------------------------------------------------
-- Column (nullable first so we can backfill before enforcing NOT NULL).
-- ---------------------------------------------------------------------------

alter table public.organizations
  add column if not exists slug text;

-- ---------------------------------------------------------------------------
-- generate_org_slug(desired): a unique, non-reserved slug based on `desired`,
-- disambiguating collisions with a numeric suffix (kept within 63 chars).
-- security definer so the trigger and backfill can read existing slugs.
-- ---------------------------------------------------------------------------

create or replace function public.generate_org_slug(desired text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  base text := public.slugify(desired);
  cand text := base;
  n    int  := 1;
begin
  while exists (select 1 from public.organizations o where o.slug = cand)
        or cand = any (public.reserved_slugs())
  loop
    -- Truncate the base so "base-N" still fits in 63 chars.
    cand := left(base, 63 - (char_length(n::text) + 1)) || '-' || n;
    n := n + 1;
  end loop;
  return cand;
end;
$$;

-- ---------------------------------------------------------------------------
-- Backfill existing orgs.
-- ---------------------------------------------------------------------------

do $$
declare
  r record;
begin
  for r in select id, name from public.organizations where slug is null order by created_at
  loop
    update public.organizations
      set slug = public.generate_org_slug(r.name)
      where id = r.id;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Constraints: unique + DNS-label format. Added after backfill so every row
-- already satisfies them.
-- ---------------------------------------------------------------------------

create unique index if not exists organizations_slug_key
  on public.organizations (slug);

alter table public.organizations
  drop constraint if exists organizations_slug_format;

alter table public.organizations
  add constraint organizations_slug_format
  check (
    slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'
    and char_length(slug) between 3 and 63
  );

alter table public.organizations
  alter column slug set not null;

-- ---------------------------------------------------------------------------
-- handle_new_user: assign a slug when creating the org at signup. Only the org
-- path changes; the rest matches 20260819150000_org_creator_archer.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta       jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  org_name   text  := nullif(meta ->> 'organization_name', '');
  new_org    uuid;
  child      jsonb;
  new_archer uuid;
begin
  -- Always: create the profile.
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    meta ->> 'full_name',
    nullif(meta ->> 'phone', '')
  );

  -- Org signup path: create the org (with a generated URL slug), make the
  -- signer its admin, and enroll them as an archer in that org.
  if org_name is not null then
    insert into public.organizations (name, slug, created_by)
    values (org_name, public.generate_org_slug(org_name), new.id)
    returning id into new_org;

    insert into public.organization_members (organization_id, profile_id, member_role)
    values (new_org, new.id, 'admin');

    insert into public.archers (full_name, email, user_id, organization_id, created_by)
    values (coalesce(meta ->> 'full_name', 'Archer'), new.email, new.id, new_org, new.id);
  end if;

  -- Team archer signup (future flow): the signer is themselves an archer.
  if coalesce((meta ->> 'is_archer')::boolean, false) then
    insert into public.archers (full_name, email, user_id, created_by)
    values (coalesce(meta ->> 'full_name', 'Archer'), new.email, new.id, new.id);
  end if;

  -- A parent's children (future flow): each becomes an archer + guardianship.
  if jsonb_typeof(meta -> 'children') = 'array' then
    for child in select * from jsonb_array_elements(meta -> 'children')
    loop
      insert into public.archers (full_name, date_of_birth, email, created_by)
      values (
        child ->> 'full_name',
        nullif(child ->> 'date_of_birth', '')::date,
        nullif(child ->> 'email', ''),
        new.id
      )
      returning id into new_archer;

      insert into public.guardianships (archer_id, guardian_id)
      values (new_archer, new.id);
    end loop;
  end if;

  return new;
end;
$$;
