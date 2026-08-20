-- Anchor — organization signup flow + role scaffold.
--
-- The public /signup flow onboards an *organization*: the person signing up
-- creates their org and becomes its admin. The archer / parent / parent+archer
-- self-roles are scaffolded here (tables + trigger paths) for a later
-- team-specific signup flow, but this migration's UI only exercises the org
-- admin path.
--
-- Everything stays direct-to-Supabase with RLS as the security boundary; the
-- provisioning trigger runs `security definer` (like handle_new_user already
-- did) so multi-row signup provisioning happens in one transaction, past RLS.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

-- Self-selected roles a person holds (used by the future team-signup flow).
create type public.app_role as enum ('archer', 'parent');

-- A person's role *within* an organization. `admin` comes from creating the
-- org (this flow); `instructor` is assigned by an admin (later feature).
create type public.org_member_role as enum ('admin', 'instructor', 'archer');

-- ---------------------------------------------------------------------------
-- profiles: add optional, unverified phone contact (NOT an auth identifier)
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists phone text;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- Which self-roles a person holds; multi-valued so "parent + archer" is just
-- two rows. Drives the later team-signup flow.
create table public.user_roles (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role       public.app_role not null,
  created_at timestamptz not null default now(),
  primary key (profile_id, role)
);

create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_by  uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.organization_members (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id      uuid not null references public.profiles (id) on delete cascade,
  member_role     public.org_member_role not null,
  created_at      timestamptz not null default now(),
  unique (organization_id, profile_id)
);

-- An archer entity. May have its own login (user_id set) or be a
-- parent-managed dependent (user_id null). Used by the team-signup flow.
create table public.archers (
  id              uuid primary key default gen_random_uuid(),
  full_name       text not null,
  date_of_birth   date,
  user_id         uuid references auth.users (id) on delete set null,
  organization_id uuid references public.organizations (id) on delete set null,
  created_by      uuid not null references auth.users (id) on delete cascade,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Parent ↔ archer link. Used by the team-signup flow.
create table public.guardianships (
  id           uuid primary key default gen_random_uuid(),
  archer_id    uuid not null references public.archers (id) on delete cascade,
  guardian_id  uuid not null references auth.users (id) on delete cascade,
  relationship text not null default 'parent',
  created_at   timestamptz not null default now(),
  unique (archer_id, guardian_id)
);

-- Scaffold for the future team-join flow: an admin invites archers / parents /
-- instructors into their org by code or email.
create table public.invitations (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  invited_role    public.org_member_role not null,
  email           text,
  created_by      uuid not null references auth.users (id) on delete cascade,
  accepted_by     uuid references auth.users (id) on delete set null,
  expires_at      timestamptz,
  created_at      timestamptz not null default now()
);

-- Keep updated_at fresh (reuses the function from the init migration).
create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

create trigger archers_set_updated_at
  before update on public.archers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Helper functions (security definer → bypass RLS to avoid policy recursion
-- when a policy needs to check organization membership).
-- ---------------------------------------------------------------------------

create or replace function public.is_org_member(org uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org and m.profile_id = (select auth.uid())
  );
$$;

create or replace function public.is_org_admin(org uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org
      and m.profile_id = (select auth.uid())
      and m.member_role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.user_roles           enable row level security;
alter table public.organizations        enable row level security;
alter table public.organization_members enable row level security;
alter table public.archers              enable row level security;
alter table public.guardianships        enable row level security;
alter table public.invitations          enable row level security;

-- user_roles: owner-only. Writes currently happen in the provisioning trigger.
create policy "Users can read their own roles"
  on public.user_roles for select to authenticated
  using ((select auth.uid()) = profile_id);

-- organizations: members read; the creator inserts; admins update.
create policy "Members can read their organization"
  on public.organizations for select to authenticated
  using (public.is_org_member(id));

create policy "Users can create organizations they own"
  on public.organizations for insert to authenticated
  with check ((select auth.uid()) = created_by);

create policy "Admins can update their organization"
  on public.organizations for update to authenticated
  using (public.is_org_admin(id))
  with check (public.is_org_admin(id));

-- organization_members: you can see your own membership; admins manage members.
create policy "Read own membership or as org admin"
  on public.organization_members for select to authenticated
  using (
    (select auth.uid()) = profile_id
    or public.is_org_admin(organization_id)
  );

create policy "Admins manage members"
  on public.organization_members for all to authenticated
  using (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));

-- archers: readable/writable by the archer, a guardian, or an org admin.
create policy "Read archers you own, guard, or administer"
  on public.archers for select to authenticated
  using (
    user_id = (select auth.uid())
    or created_by = (select auth.uid())
    or exists (
      select 1 from public.guardianships g
      where g.archer_id = id and g.guardian_id = (select auth.uid())
    )
    or (organization_id is not null and public.is_org_admin(organization_id))
  );

create policy "Write archers you own, guard, or administer"
  on public.archers for all to authenticated
  using (
    user_id = (select auth.uid())
    or created_by = (select auth.uid())
    or exists (
      select 1 from public.guardianships g
      where g.archer_id = id and g.guardian_id = (select auth.uid())
    )
    or (organization_id is not null and public.is_org_admin(organization_id))
  )
  with check (
    user_id = (select auth.uid())
    or created_by = (select auth.uid())
    or exists (
      select 1 from public.guardianships g
      where g.archer_id = id and g.guardian_id = (select auth.uid())
    )
    or (organization_id is not null and public.is_org_admin(organization_id))
  );

-- guardianships: the guardian owns their links.
create policy "Guardians manage their own links"
  on public.guardianships for all to authenticated
  using (guardian_id = (select auth.uid()))
  with check (guardian_id = (select auth.uid()));

-- invitations: org admins manage; an invitee may read a row for their email.
create policy "Admins manage their org invitations"
  on public.invitations for all to authenticated
  using (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));

create policy "Invitees can read their invitation"
  on public.invitations for select to authenticated
  using (email is not null and email = ((select auth.jwt()) ->> 'email'));

-- ---------------------------------------------------------------------------
-- Provisioning trigger: replaces handle_new_user. Reads signup metadata and
-- creates the role-specific rows in one transaction. Composable so the future
-- team-signup flow reuses it without schema changes.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta      jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  org_name  text  := nullif(meta ->> 'organization_name', '');
  new_org   uuid;
  role_txt  text;
  archer    jsonb;
  new_archer uuid;
begin
  -- Always: create the profile.
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    meta ->> 'full_name',
    nullif(meta ->> 'phone', '')
  );

  -- Org signup path (this flow): create the org and make the signer its admin.
  if org_name is not null then
    insert into public.organizations (name, created_by)
    values (org_name, new.id)
    returning id into new_org;

    insert into public.organization_members (organization_id, profile_id, member_role)
    values (new_org, new.id, 'admin');
  end if;

  -- Self-roles (future team-signup flow; fires only when metadata provides them).
  for role_txt in
    select jsonb_array_elements_text(meta -> 'roles')
    where jsonb_typeof(meta -> 'roles') = 'array'
  loop
    insert into public.user_roles (profile_id, role)
    values (new.id, role_txt::public.app_role)
    on conflict do nothing;

    -- An archer self-role gets their own archer record.
    if role_txt = 'archer' then
      insert into public.archers (full_name, user_id, created_by)
      values (coalesce(meta ->> 'full_name', 'Archer'), new.id, new.id);
    end if;
  end loop;

  -- A parent's dependent archers (each becomes a managed archer + guardianship).
  if jsonb_typeof(meta -> 'archers') = 'array' then
    for archer in select * from jsonb_array_elements(meta -> 'archers')
    loop
      insert into public.archers (full_name, date_of_birth, created_by)
      values (
        archer ->> 'full_name',
        nullif(archer ->> 'date_of_birth', '')::date,
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

-- Trigger itself is unchanged from the init migration (after insert on
-- auth.users), so this just swaps the function body.
