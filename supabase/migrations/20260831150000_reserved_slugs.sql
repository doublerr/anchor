-- Anchor — expand the reserved-slug list so a club can never take a name that
-- collides with the marketing site, the app, auth flows, or crawler endpoints
-- served at the apex. Mirror of RESERVED_SLUGS in apps/web/src/lib/slug.ts.
--
-- Only affects future slug generation/validation; existing slugs are untouched.

create or replace function public.reserved_slugs()
returns text[]
language sql
immutable
set search_path = ''
as $$
  select array[
    -- Infrastructure & system
    'www','app','admin','api','cdn','assets','static','mail','ftp','root',
    'dev','staging','test','status',
    -- Metadata / crawler endpoints
    'robots','sitemap','manifest','favicon','icon','apple-icon',
    'opengraph-image','llms','feed','rss',
    -- Auth & account
    'auth','login','logout','signin','signout','signup','register','join',
    'invite','onboarding','account','billing','verify','reset','password',
    'confirm','email','me','profile','user','users','notifications','settings',
    -- App routes
    'dashboard','overview','members','locations','site','create-organization',
    'new','search','explore',
    -- Marketing & company
    'about','pricing','features','faq','contact','home','product','docs',
    'resources','company','careers','legal','security','privacy','terms',
    'cookies','integrations','changelog','roadmap','demo','download',
    'enterprise','sales','partners','press','blog','help','support','anchor'
  ];
$$;
