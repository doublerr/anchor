-- Anchor — org creators are archers in their own org.
--
-- Follow-up to 20260819130000. When someone creates an organization via the
-- /signup flow they're already made its admin; now we also insert an `archers`
-- row for them (user_id = self, organization_id = the new org) so the club
-- owner is an admin *and* an archer (is_archer() true). The club owner shoots
-- too.
--
-- Only the trigger body changes; `create or replace` is idempotent.

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

  -- Org signup path (this flow): create the org, make the signer its admin,
  -- and enroll them as an archer in that org.
  if org_name is not null then
    insert into public.organizations (name, created_by)
    values (org_name, new.id)
    returning id into new_org;

    insert into public.organization_members (organization_id, profile_id, member_role)
    values (new_org, new.id, 'admin');

    -- The org creator is also an archer in their own org (they shoot too).
    -- "is an archer" is then derived from this archers row (user_id = self).
    insert into public.archers (full_name, email, user_id, organization_id, created_by)
    values (coalesce(meta ->> 'full_name', 'Archer'), new.email, new.id, new_org, new.id);
  end if;

  -- Team archer signup (future flow): the signer is themselves an archer.
  if coalesce((meta ->> 'is_archer')::boolean, false) then
    insert into public.archers (full_name, email, user_id, created_by)
    values (coalesce(meta ->> 'full_name', 'Archer'), new.email, new.id, new.id);
  end if;

  -- A parent's children (future flow): each becomes an archer record (with an
  -- optional email — no account required) plus a guardianship link.
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
