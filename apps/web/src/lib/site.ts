/**
 * Canonical site-wide constants: the public URL, product identity, and the
 * pricing/FAQ content that powers both the rendered marketing page and the
 * structured data (JSON-LD) we emit for search engines and AI crawlers.
 *
 * Keeping this in one place means the human-readable page and the
 * machine-readable metadata never drift apart.
 */

// The public marketing origin. Overridable per-environment (preview deploys,
// staging) via NEXT_PUBLIC_SITE_URL; defaults to the production domain. Note
// club tenants live on `*.anchorplatforms.site` subdomains — this is the
// apex marketing site.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://anchorplatforms.site"
).replace(/\/$/, "");

export const SITE_NAME = "Anchor";
export const ORG_NAME = "Anchor Platforms";

// Bare apex domain that club tenant URLs hang off of: the default path form
// `anchorplatforms.site/{slug}` today, and the `{slug}.anchorplatforms.site`
// subdomain form later (a paid feature). Kept separate from SITE_URL (which
// carries a scheme) because it's composed into both paths and hostnames.
export const CLUB_URL_DOMAIN = "anchorplatforms.site";

export const SITE_TAGLINE = "Archery club & team management software";

export const SITE_DESCRIPTION =
  "Anchor is the all-in-one platform for archery clubs and teams — manage " +
  "members, track scores, schedule practice and classes, collect payments, " +
  "and run competitions from one shared home.";

// Keyword themes we want to be discoverable for. Kept intentionally focused —
// stuffing hurts more than it helps.
export const SITE_KEYWORDS = [
  "archery club management software",
  "archery team management",
  "archery club software",
  "archery scoring app",
  "JOAD program management",
  "archery class scheduling",
  "archery club roster",
];

/**
 * Pricing tiers in machine-readable form, mirroring the visual pricing cards.
 * Prices are USD per month (0 for the free tier). Used to emit schema.org
 * Offer nodes.
 */
export const PRICING = [
  { name: "Free", price: 0, cadence: "forever" },
  { name: "Standard", price: 99, cadence: "per month" },
  { name: "Pro", price: 149, cadence: "per month" },
] as const;

/**
 * Frequently asked questions. Rendered as an on-page FAQ section AND emitted
 * as FAQPage structured data, which both Google (rich results) and generative
 * AI engines lift answers from directly.
 */
export const FAQ = [
  {
    q: "What is Anchor?",
    a: "Anchor is an all-in-one management platform built specifically for archery clubs and teams. It brings your member roster, class scheduling, scoring and analytics, payments, and club communications together in one shared home so coaches and admins spend less time on busywork.",
  },
  {
    q: "How much does Anchor cost?",
    a: "Anchor has three plans. The Free plan is $0 forever and covers your club profile, member management, and an embedded class calendar. Standard is $99/month and adds your own club subdomain, notifications, payments, and calendar sync. Pro is $149/month and adds a mobile scoring app, archer lockers, analytics, and custom domain support. Optional add-ons include an AI assistant (+$25/month) and a native mobile app (+$25/month).",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. Anchor's Free plan is free forever and requires no credit card. It includes a mobile-friendly club site, member management with roles, an embedded recurring and drop-in class calendar, new-archer signup, and email newsletters.",
  },
  {
    q: "Can archers track their scores with Anchor?",
    a: "Yes. On the Pro plan, Anchor includes a mobile-friendly scoring app that records ends on the line and rolls each archer's results into per-archer progress and season analytics, so improvement is easy to see across the season.",
  },
  {
    q: "Does Anchor work for youth archery programs like JOAD?",
    a: "Yes. Anchor supports guardian links for youth archers, role-based access for coaches and parents, self-serve join links, and class credits — making it a good fit for JOAD and other youth archery programs.",
  },
  {
    q: "How do members sign up and pay?",
    a: "New archers can join by email or phone with a self-serve link. On paid plans, clubs collect dues and fees through Stripe and Zelle, and can offer class credits and automatic sign-up.",
  },
] as const;
