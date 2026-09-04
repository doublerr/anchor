<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


# Development

Do not use your built-in browser when directly working with the user (subagents can still use it). Instead use the devcontainer and docker exec to control it.

# Conventions

NextJS
Supabase
TailwindCSS
React
Mobile friendly designs

Coding: prefer components when creating new things
# Public club sites

Applies to `src/app/(public-site)/`, `src/components/public-site/` and the
`/site` editor that feeds them — **not** the marketing home or the admin
dashboard, which are ordinary product UI and follow the conventions above.

A club site is an information site for a local business, not a SaaS surface.
Most of its traffic is a stranger on a phone deciding whether to show up in
person. Design for that reader.

## Rules

Each of these was a deliberate decision. Change one only on purpose, not as a
side effect of another change.

- **Images carry the page.** Every section that can hold a photo does. Never add
  a text-only card grid where an image slot would fit. All images go through
  `ui/site-photo.tsx` — never a bare `<img>` or a bare `next/image`.
- **One accent per screen.** `--club-accent` is reserved for the single thing we
  want tapped: the call to action, and the featured pricing tier. Eyebrows,
  dates, meta and labels use `text-muted-foreground`. Spreading the accent over
  every small label is what made the old template's CTA invisible.
- **Cap the primary nav at `NAV_LIMIT` (5).** Overflow goes to the footer
  sitemap, never into the bar. Past roughly five choices people stop reading a
  nav and start scanning it.
- **One CTA per viewport.** The announcement bar deliberately has no button —
  it used to duplicate the hero's, so the page opened with two competing
  targets and neither stood out.
- **Cap list sections on the home page** and link to the full set: 3 highlights,
  3 programs, 3 events, 3 pricing tiers, 6 gallery tiles. The caps are named
  constants at the top of each section file.
- **Everything tappable clears 44px** — add `club-tap`. Make the whole card the
  target, not a 12px "Learn more →" at the bottom of it.
- **Mobile keeps its own affordances**: the nav sheet (`mobile-nav.tsx`) and the
  thumb-zone bar (`mobile-action-bar.tsx`). A `hidden md:flex` nav with no
  mobile counterpart is how this template shipped with *no* navigation on
  phones. Check every new nav affordance at 375px.
- **Group by what the reader is asking.** Address, directions, phone, email and
  hours belong in one region (`sections/visit.tsx`). Don't reintroduce a
  separate contact section.
- **The page ends on an invitation**, not a fading contact list — `closing-cta.tsx`.
- **Every section returns `null` when the club has no data**, and a club with
  only a name must still look designed. Check the bare case before shipping.
- **Third-party embeds load on tap, not on load** — see `ui/map-embed.tsx`.
  Don't put a live Google Maps iframe (or any other vendor frame) in the
  initial render.
- **Accessibility is part of done**: `focus-visible` rings, `aria-expanded` on
  disclosures, `inert` on the background behind a modal, focus restored to the
  trigger on close, and contrast checked against a *photo* rather than assumed.

## Gotchas that have already cost time

- **`priority` is deprecated on `next/image` in Next 16** — use `preload`.
- **`hidden md:inline-flex` silently fails** on anything built from
  `buttonBase`, which already sets `inline-flex`. Same specificity means
  stylesheet order wins and `hidden` loses. Use `max-md:hidden`.
- **`backdrop-blur` makes an element a containing block for `position: fixed`
  descendants.** A modal rendered inside the sticky header resolves `inset-0`
  against the header, not the viewport. Portal it to `document.body`.
- **`<main id="main">` belongs inside each page**, wrapping only the content
  between the club header and footer — not around them in the layout, which
  makes the skip link a no-op and nests the banner/contentinfo landmarks.
- **Hero contrast depends on hero height.** The hero is content-sized on short
  phones, which floats the text further up the scrim. Any scrim change has to
  hold 4.5:1 for the 14px eyebrow over a pure-white photo pixel at the *top*
  stop, not just where the text happens to sit today.

## Site essentials

`src/lib/site-essentials.ts` and `public.org_site_ready()` (see the
site-essentials migration) define the minimum content a club must provide
before its URL is served at all. **They mirror each other and must be changed
together** — the SQL is the real gate because it sits inside the anon-readable
views; the TypeScript only drives the UI that explains it.

## SEO

- Club metadata and structured data live in `src/lib/club-seo.ts`. New club
  pages should use `clubMetadata()` so they get a canonical, a location-aware
  title and the club's own branding rather than the `%s · Anchor` template.
- **Never add text hidden purely for crawlers.** It is a Google spam policy
  violation, and every club shares one domain, so a penalty hits all of them.
  Location keywords go in visible copy a reader wants anyway, and in JSON-LD.
- Anchor's own `Organization`/`SoftwareApplication` schema is scoped to the
  `(marketing)` layout on purpose. Don't move it back to the root layout — it
  made every club page declare itself to be our software product, pricing
  included.
- New public club routes must be added to `sitemap.ts`, and listed only when
  they have real content.
