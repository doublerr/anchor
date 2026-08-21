/**
 * URL-safe organization slug rules, kept in sync with the DB
 * (20260820130000_org_slug.sql). A slug must be a valid DNS label so it can
 * serve as both a path segment (/{slug}) and, later, a subdomain
 * ({slug}.…): 3–63 chars, lowercase a–z / 0–9 / hyphen, with no leading,
 * trailing, or doubled hyphen. Reserved words are blocked.
 */

export const SLUG_MIN = 3;
export const SLUG_MAX = 63;

/** Human-readable organization name limits (the display name, not the slug). */
export const ORG_NAME_MIN = 2;
export const ORG_NAME_MAX = 100;

/** Slugs reserved for routing / infra — mirror of public.reserved_slugs(). */
export const RESERVED_SLUGS = new Set([
  "www", "app", "admin", "api", "auth", "login", "signup", "onboarding",
  "dashboard", "settings", "members", "locations", "account", "billing",
  "mail", "ftp", "blog", "help", "support", "status", "staging", "dev",
  "test", "assets", "static", "cdn", "root", "anchor", "about", "pricing",
  "terms", "privacy",
]);

const SLUG_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

/**
 * Derive a candidate slug from arbitrary text (e.g. an org name). Mirrors the
 * SQL `slugify`, minus the random fallback — a too-short result is returned as
 * is so the caller can surface a validation error.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/^-+|-+$/g, "");
}

/**
 * Validate a slug against the DNS-label rules. Returns a human-readable error
 * message, or `null` when the slug is valid.
 */
export function validateSlug(slug: string): string | null {
  if (slug.length < SLUG_MIN)
    return `URL must be at least ${SLUG_MIN} characters.`;
  if (slug.length > SLUG_MAX)
    return `URL must be at most ${SLUG_MAX} characters.`;
  if (!SLUG_PATTERN.test(slug))
    return "URL may use only lowercase letters, numbers, and single hyphens (no leading or trailing hyphen).";
  if (RESERVED_SLUGS.has(slug)) return `“${slug}” is reserved. Try another URL.`;
  return null;
}

/**
 * Validate a human-readable org name. Returns an error message or `null`.
 */
export function validateOrgName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < ORG_NAME_MIN)
    return `Organization name must be at least ${ORG_NAME_MIN} characters.`;
  if (trimmed.length > ORG_NAME_MAX)
    return `Organization name must be at most ${ORG_NAME_MAX} characters.`;
  return null;
}
