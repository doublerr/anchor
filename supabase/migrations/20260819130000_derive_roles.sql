-- Anchor — derive roles instead of storing them; add optional archer email.
--
-- Follow-up to 20260819120000_org_signup. We drop the `user_roles` table (and
-- its `app_role` enum): a person's roles are now *derived* from the rows that
-- already exist, so a flag can never drift from reality:
--   * "is an org admin" -> has an organization_members(admin) row
--   * "is a guardian"   -> has a guardianships row as guardian
--   * "is an archer"    -> has an archers row with user_id = self
--
-- An archer may or may not have their own login. `archers.email` lets a parent
-- record a child's email (optional) before any account exists.
--
-- Written idempotently (drop if exists / add if not exists / create or replace)
-- so it applies cleanly whether or not 20260819120000's objects are present.

-- ---------------------------------------------------------------------------
-- Drop the stored-role table + enum.
-- ---------------------------------------------------------------------------

drop table if exists public.user_roles;
drop type  if exists public.app_role;

-- Drop the speculative invitations scaffold — nothing uses it yet, and the
-- future team-join flow will define invites when it actually exists (possibly
-- via Supabase's own invite + signup metadata rather than a table).
drop table if exists public.invitations;

-- ---------------------------------------------------------------------------
-- Optional archer email (no account required).
-- ---------------------------------------------------------------------------

alter table public.archers
  add column if not exists email text;

-- ---------------------------------------------------------------------------
-- Derived-role helpers for the current user.
-- ---------------------------------------------------------------------------

create or replace function public.is_guardian()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.guardianships g
    where g.guardian_id = (select auth.uid())
  );
$$;

create or replace function public.is_archer()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.archers a
    where a.user_id = (select auth.uid())
  );
$$;

-- ---------------------------------------------------------------------------
-- Reprovisioning trigger: no more user_roles writes. Roles are derived from
-- the org membership / archer / guardianship rows this creates.
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

  -- Org signup path (this flow): create the org and make the signer its admin.
  -- "is an org admin" is then derived from this organization_members row.
  if org_name is not null then
    insert into public.organizations (name, created_by)
    values (org_name, new.id)
    returning id into new_org;

    insert into public.organization_members (organization_id, profile_id, member_role)
    values (new_org, new.id, 'admin');
  end if;

  -- Team archer signup (future flow): the signer is themselves an archer.
  -- "is an archer" is then derived from this archers row (user_id = self).
  if coalesce((meta ->> 'is_archer')::boolean, false) then
    insert into public.archers (full_name, email, user_id, created_by)
    values (coalesce(meta ->> 'full_name', 'Archer'), new.email, new.id, new.id);
  end if;

  -- A parent's children (future flow): each becomes an archer record (with an
  -- optional email — no account required) plus a guardianship link.
  -- "is a guardian" is then derived from these guardianship rows.
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
