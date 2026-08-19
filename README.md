# Anchor

Archery club management software. A monorepo housing the frontend and (eventually) backend.

## Stack

- **Monorepo:** [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces) + [Turborepo](https://turborepo.com)
- **Frontend:** [Next.js](https://nextjs.org) 16 (App Router) · TypeScript · Tailwind CSS
- **Auth & data:** [Supabase](https://supabase.com) — the browser/server talk **directly** to Supabase; access is enforced by Postgres Row Level Security (no custom backend)
- **Dev environment:** Dev Containers

## Layout

```
anchor/
├── apps/
│   └── web/                  # Next.js frontend
│       └── src/
│           ├── app/
│           │   ├── login/    # sign in / sign up (Server Actions)
│           │   ├── auth/     # email-confirm route handler
│           │   └── page.tsx  # protected home (reads own profile via RLS)
│           ├── lib/supabase/ # browser + server clients, session refresh
│           └── proxy.ts      # Next 16 middleware: refresh session + gate routes
├── supabase/
│   ├── migrations/           # SQL schema (profiles + RLS policies + signup trigger)
│   └── config.toml
├── packages/                 # shared packages (created as needed)
├── .devcontainer/            # Dev Container definition
├── package.json              # npm workspaces root
└── turbo.json
```

## Getting started

The recommended workflow is the Dev Container. In VS Code / Cursor, open the repo
and choose **"Reopen in Container"**. Dependencies install automatically.

To run outside a container you need Node 22+ (npm ships with it):

```bash
npm install
npm run dev       # runs every app's dev task (web on http://localhost:3000)
```

### Common commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start all apps in dev mode |
| `npm run build` | Build all apps |
| `npm run lint` | Lint all packages |
| `npm run <cmd> -w @anchor/web` | Run a command in a single app |

## Supabase & auth

Auth and data go **direct to Supabase** from the frontend; Row Level Security is
the security boundary. There is intentionally no API server.

### One-time setup

1. **Create a project** at [supabase.com](https://supabase.com) (or reuse one).
2. **Set env vars** — from _Project Settings → API_:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   # fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
   ```
3. **Apply the schema** — either paste `supabase/migrations/*.sql` into the
   dashboard SQL editor, or push with the CLI:
   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
4. **Point the confirm email at the app** — in _Authentication → Email Templates →
   Confirm signup_, set the link to:
   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
   ```
   and add `http://localhost:3000` under _Authentication → URL Configuration_.
   _(To skip email confirmation while developing, disable “Confirm email” under
   Authentication → Providers → Email.)_

### How it fits together

- `src/lib/supabase/{client,server}.ts` — Supabase clients for browser and server.
- `src/proxy.ts` + `src/lib/supabase/session.ts` — refresh the session on every
  request and redirect signed-out users to `/login`.
- `src/app/login/` — email + password sign in / sign up via Server Actions.
- `profiles` table — one row per user, created automatically on signup by a DB
  trigger and readable/writable only by its owner via RLS. Add future domain
  tables (clubs, members, events…) the same way: `enable row level security`
  plus policies keyed on `auth.uid()`.

## Roadmap

- [x] Next.js frontend scaffold
- [x] Supabase auth (email + password) + RLS `profiles` schema
- [ ] Domain schema — clubs, memberships, events (RLS-guarded)
- [ ] Google OAuth / magic-link sign-in (optional)
