/**
 * What a club has to provide before its public page is allowed to go live.
 *
 * A club page with no photograph, no tagline, nothing about the club and no
 * programs isn't a thin page — it's a page that actively costs the club
 * credibility with the person reading it. So rather than publishing whatever an
 * admin happens to have filled in, Anchor holds the URL dark until the page is
 * worth visiting.
 *
 * This list is the single definition. `public.org_site_ready()` in the database
 * enforces exactly the same rules (see the site-essentials migration) — that is
 * the real gate, because it sits inside the anon-readable views and can't be
 * routed around. Everything here drives the UI that tells an admin what's left.
 */

/**
 * The shape the checks need. Deliberately structural, so both the admin-side
 * `Organization` row and the editor's in-progress `SiteContentPayload` satisfy
 * it — the editor can then show readiness live, before anything is saved.
 */
export type SiteEssentialsInput = {
  hero_image_url: string | null;
  tagline: string | null;
  about: string | null;
  /**
   * The short description collected during onboarding. The public About section
   * falls back to it when `about` is empty, so it satisfies the copy
   * requirement too — a club shouldn't be asked twice for the same paragraph.
   */
  description?: string | null;
  programs: { name?: string }[] | null;
};

export type SiteEssential = {
  id: string;
  /** Shown as the checklist row. */
  label: string;
  /** Why it matters — this is the part that persuades, so it isn't filler. */
  help: string;
  /** Which /site editor tab fixes it. */
  tab: string;
  isDone: (input: SiteEssentialsInput) => boolean;
};

function filled(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

export const SITE_ESSENTIALS: readonly SiteEssential[] = [
  {
    id: "hero_image_url",
    label: "A hero photo",
    help: "One photo of your range or your archers, full width at the top of the page. Nothing else you add will do as much work.",
    tab: "design",
    isDone: (i) => filled(i.hero_image_url),
  },
  {
    id: "tagline",
    label: "A tagline",
    help: "One line under your club name saying who you're for — the first thing a visitor reads after the name itself.",
    tab: "home",
    isDone: (i) => filled(i.tagline),
  },
  {
    id: "about",
    label: "A paragraph about your club",
    help: "A short introduction. Without it your page is a name and a photo, and a visitor has no reason to choose you.",
    tab: "home",
    isDone: (i) => filled(i.about) || filled(i.description),
  },
  {
    id: "programs",
    label: "At least one program",
    help: "“What can I actually do here?” is the question people arrive with. Give it an answer.",
    tab: "programs",
    isDone: (i) => Boolean(i.programs?.some((p) => filled(p.name))),
  },
] as const;

/** The essentials this club still owes, in checklist order. */
export function missingEssentials(
  input: SiteEssentialsInput,
): SiteEssential[] {
  return SITE_ESSENTIALS.filter((e) => !e.isDone(input));
}

/**
 * Whether the club's page meets the bar to be served publicly. Mirrors
 * `public.org_site_ready()`; the database is the authority, this is for the UI.
 */
export function siteIsReady(input: SiteEssentialsInput): boolean {
  return missingEssentials(input).length === 0;
}
