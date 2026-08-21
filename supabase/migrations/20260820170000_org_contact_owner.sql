-- Anchor — organization primary contact (owner / head instructor).
--
-- The onboarding "Contact" step is now about the club's key person rather than
-- its address: their name and role/title, plus the org's existing email/phone
-- (reused as that person's contact details). The club's address(es) are
-- gathered on the Locations step instead — the primary location fills the org's
-- address columns as before.

alter table public.organizations
  add column if not exists contact_name  text,
  add column if not exists contact_title text;
