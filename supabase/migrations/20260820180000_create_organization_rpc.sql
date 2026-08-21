-- Anchor — create an organization for an already-signed-in user.
--
-- At signup, handle_new_user provisions the org from auth metadata. But a user
-- can end up with an account and NO org (e.g. they deleted their only org).
-- They need a way to create a fresh one post-login. A direct insert can't:
-- the "admin manages members" RLS policy needs an existing admin, so the very
-- first membership can't be inserted by the user. This SECURITY DEFINER RPC
-- does the same multi-row bootstrap the trigger does, in one transaction.

create or replace function public.create_organization(org_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid        uuid := (select auth.uid());
  clean_name text := nullif(btrim(org_name), '');
  new_org    uuid;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  if clean_name is null then
    raise exception 'Organization name is required';
  end if;

  insert into public.organizations (name, slug, created_by)
  values (clean_name, public.generate_org_slug(clean_name), uid)
  returning id into new_org;

  insert into public.organization_members (organization_id, profile_id, member_role)
  values (new_org, uid, 'admin');

  -- The creator is also an archer in their own org (mirrors handle_new_user).
  insert into public.archers (full_name, email, user_id, organization_id, created_by)
  values (
    coalesce((select full_name from public.profiles where id = uid), 'Archer'),
    (select email from auth.users where id = uid),
    uid,
    new_org,
    uid
  );

  return new_org;
end;
$$;

grant execute on function public.create_organization(text) to authenticated;
