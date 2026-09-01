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

/**
 * Slugs reserved for routing / infra so a club can never take a name that
 * collides with the marketing site, the app, auth, or crawler endpoints.
 * Mirror of public.reserved_slugs() — keep the two in sync.
 */
export const RESERVED_SLUGS = new Set([
  // Infrastructure & system
  "www", "app", "admin", "api", "cdn", "assets", "static", "mail", "ftp",
  "root", "dev", "staging", "test", "status",
  // Metadata / crawler endpoints (served at the apex)
  "robots", "sitemap", "manifest", "favicon", "icon", "apple-icon",
  "opengraph-image", "llms", "feed", "rss",
  // Auth & account
  "auth", "login", "logout", "signin", "signout", "signup", "register",
  "join", "invite", "onboarding", "account", "billing", "verify", "reset",
  "password", "confirm", "email", "me", "profile", "user", "users",
  "notifications", "settings",
  // App routes
  "dashboard", "overview", "members", "locations", "site",
  "create-organization", "new", "search", "explore",
  // Marketing & company
  "about", "pricing", "features", "faq", "contact", "home", "product",
  "docs", "resources", "company", "careers", "legal", "security", "privacy",
  "terms", "cookies", "integrations", "changelog", "roadmap", "demo",
  "download", "enterprise", "sales", "partners", "press", "blog", "help",
  "support", "anchor",
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
