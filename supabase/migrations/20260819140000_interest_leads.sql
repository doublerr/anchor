-- Anchor — "Interested?" landing-page waitlist.
--
-- While public signup is gated to local dev, the marketing site collects
-- interest leads instead. Anyone (anon) may submit one; nobody may read them
-- back through the public API. Leads are reviewed via the Supabase dashboard
-- or a future admin surface (service role / elevated policy).
--
-- Stays direct-to-Supabase with RLS as the security boundary: the browser
-- client inserts straight into this table under the insert-only policy below.

create table public.interest_leads (
  id         uuid primary key default gen_random_uuid(),
  email      text,
  phone      text,
  city       text,
  state      text,
  team_size  text,
  created_at timestamptz not null default now(),
  -- Require at least one way to reach them.
  constraint interest_leads_contact_present
    check (coalesce(email, phone) is not null)
);

alter table public.interest_leads enable row level security;

-- Anyone visiting the site may register interest. No SELECT/UPDATE/DELETE
-- policy exists, so leads are write-only from the public client.
create policy "Anyone can register interest"
  on public.interest_leads for insert to anon, authenticated
  with check (true);

grant insert on public.interest_leads to anon, authenticated;
