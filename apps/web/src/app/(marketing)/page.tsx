import Link from "next/link";
import { InterestForm } from "@/components/marketing/interest-form";
import { buttonPrimary, buttonSecondary } from "@/components/ui/button-styles";
import {
  RosterMockup,
  ScheduleMockup,
  ScoringMockup,
} from "@/components/marketing/feature-mockups";
import {
  ArrowRightIcon,
  BellIcon,
  BowIcon,
  CalendarIcon,
  CardIcon,
  CheckIcon,
  MembersIcon,
  ScoreIcon,
  TargetMark,
} from "@/components/marketing/icons";
import { FAQ, SITE_TAGLINE } from "@/lib/site";

export const metadata = {
  title: SITE_TAGLINE,
  description:
    "Anchor is the all-in-one platform for archery clubs and teams — manage members, track scores, schedule practice, and run competitions.",
  alternates: { canonical: "/" },
};

// FAQ structured data (schema.org FAQPage). Google surfaces this as rich
// results and generative AI engines extract the answers directly.
const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

// Tinted tile styles for feature icons, rotating through the brand accents.
const ACCENT_TILE = {
  gold: "bg-gold-100 text-gold-700 dark:bg-gold-400/15 dark:text-gold-300",
  aqua: "bg-aqua-100 text-aqua-700 dark:bg-aqua-400/15 dark:text-aqua-300",
  coral: "bg-coral-100 text-coral-700 dark:bg-coral-400/15 dark:text-coral-300",
} as const;

// Flagship capabilities — each gets a full alternating row with an in-app
// "screenshot" (see feature-mockups) beside the copy.
const SHOWCASE = [
  {
    icon: MembersIcon,
    accent: "gold",
    eyebrow: "Members & roles",
    title: "One roster for archers, parents, and coaches",
    body: "Keep contact details, roles, and status in a single shared roster. Assign the right access to instructors and admins, and let members join with a link — every profile is theirs to keep.",
    points: ["Role-based access", "Self-serve join links", "Guardian links for youth archers"],
    Mockup: RosterMockup,
  },
  {
    icon: CalendarIcon,
    accent: "aqua",
    eyebrow: "Classes & scheduling",
    title: "Practice and classes that fill themselves",
    body: "An embedded site calendar handles recurring and drop-in classes, capacity limits, and class credits. Archers sign up in a tap and you always know who's on the line.",
    points: ["Recurring & drop-in classes", "Live sign-up counts", "Class credits & auto sign-up"],
    Mockup: ScheduleMockup,
  },
  {
    icon: ScoreIcon,
    accent: "coral",
    eyebrow: "Scoring & analytics",
    title: "Every arrow, tracked and trending",
    body: "A mobile-friendly scoring app records ends on the line, then rolls each archer's progress into clean analytics — so improvement is something you can actually see across the season.",
    points: ["Score on any phone", "Per-archer progress", "Season & class analytics"],
    Mockup: ScoringMockup,
  },
] as const;

// Secondary capabilities — compact icon cards below the showcases.
const FEATURES = [
  {
    icon: BellIcon,
    accent: "gold",
    title: "Communications",
    body: "Reach members over email, SMS, browser push, and WhatsApp — announcements, reminders, and nudges.",
  },
  {
    icon: CardIcon,
    accent: "aqua",
    title: "Payments & gear",
    body: "Collect dues and fees through Stripe and Zelle, and point new archers to recommended gear lists.",
  },
  {
    icon: BowIcon,
    accent: "coral",
    title: "Archer lockers",
    body: "Give each archer private video and media hosting plus saved bow settings they carry season to season.",
  },
] as const;

const PLANS = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    highlight: false,
    inherits: null,
    features: [
      "Club profile: contact info, locations & instructors",
      "Mobile-friendly site hosting",
      "Member management with roles",
      "Embedded class calendar (recurring & drop-in)",
      "New-archer signup by email or phone",
      "Email content & newsletters",
    ],
    cta: "Start free",
  },
  {
    name: "Standard",
    price: "$99",
    cadence: "per month",
    highlight: true,
    inherits: "Free",
    features: [
      "Your own club subdomain (yourclub.anchorplatforms.site)",
      "Email, SMS & browser push notifications",
      "Google & Apple login with calendar sync",
      "Auto sign-up & class credits",
      "Stripe & Zelle payments",
      "Club media hosting",
      "Recommended gear lists",
    ],
    cta: "Start free trial",
  },
  {
    name: "Pro",
    price: "$149",
    cadence: "per month",
    highlight: false,
    inherits: "Standard",
    features: [
      "Custom domain support (yourclub.com)",
      "WhatsApp integration",
      "Web-based scoring app for mobile",
      "Archer lockers: private video & bow settings",
      "Class & score analytics",
      "Weekly themed content & auto intro emails",
      "Member engagement nudges",
    ],
    cta: "Start free trial",
  },
];

const ADDONS = [
  {
    name: "AI assistant",
    price: "+$25",
    cadence: "per month",
    requires: "Requires Standard or Pro",
    body: "Your club's own chatbot that can take action across the site — guiding new-member signup, answering questions, and more — plus auto-scoring from photos and videos.",
  },
  {
    name: "Native mobile app",
    price: "+$25",
    cadence: "per month",
    requires: "Requires Pro",
    body: "A branded iOS and Android app for your team, so members carry your club in their pocket.",
  },
];

// Concentric target rings (outer → in). Gaps use the surface token so the
// bullseye stays crisp in both light and dark themes.
const TARGET_RINGS = [
  "inset-0 bg-ink-900 dark:bg-ink-100",
  "inset-[11%] bg-surface",
  "inset-[22%] bg-aqua-400",
  "inset-[33%] bg-coral-400",
  "inset-[42%] bg-gold-400",
];

export default function Home() {
  // Public sign-in / signup is gated to local dev for now; everyone else sees
  // the "Interested?" lead-capture flow instead.
  const authEnabled = process.env.NODE_ENV === "development";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(255,210,87,0.16),transparent)]"
          />
          <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
                <TargetMark className="h-3.5 w-3.5 text-foreground" />
                Built for archery clubs & teams
              </span>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Run your archery club without the busywork.
              </h1>
              <p className="mt-6 max-w-lg text-lg text-muted-foreground">
                Anchor brings your roster, scores, practice schedule, and
                competitions together in one clean, shared home — so you can
                spend more time on the line and less time on admin.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {authEnabled ? (
                  <Link href="/login" className={`${buttonPrimary} px-5 py-3 text-sm`}>
                    Create your organization
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                ) : null}
                <InterestForm
                  className={`${
                    authEnabled ? buttonSecondary : buttonPrimary
                  } px-5 py-3 text-sm`}
                />
                <a href="#features" className={`${buttonSecondary} px-5 py-3 text-sm`}>
                  See features
                </a>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Free to start · No credit card required
              </p>
            </div>

            {/* Target motif */}
            <div className="relative mx-auto aspect-square w-full max-w-[260px] sm:max-w-xs lg:max-w-sm">
              <div className="absolute inset-0 rounded-full bg-muted" />
              {TARGET_RINGS.map((cls) => (
                <div key={cls} className={`absolute rounded-full ${cls}`} aria-hidden />
              ))}
              <div
                aria-hidden
                className="absolute top-1/2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-900"
              />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-border bg-muted">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-24">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Everything your club needs, on one target
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Purpose-built for the way archery clubs and teams actually run —
                from your first recruit to your season championship.
              </p>
            </div>

            {/* Flagship showcases — copy alternates sides with an app preview */}
            <div className="mt-16 flex flex-col gap-16 lg:gap-24">
              {SHOWCASE.map((item, i) => (
                <div
                  key={item.eyebrow}
                  className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
                >
                  {/* Copy */}
                  <div className={i % 2 === 1 ? "lg:order-2" : undefined}>
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${ACCENT_TILE[item.accent]}`}
                      >
                        <item.icon className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                        {item.eyebrow}
                      </span>
                    </div>
                    <h3 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-lg text-muted-foreground">
                      {item.body}
                    </p>
                    <ul className="mt-6 flex flex-col gap-2.5">
                      {item.points.map((point) => (
                        <li key={point} className="flex items-center gap-2.5 text-sm">
                          <CheckIcon className="h-4 w-4 shrink-0 text-gold-600" />
                          <span className="text-foreground/90">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* App preview */}
                  <div className={i % 2 === 1 ? "lg:order-1" : undefined}>
                    <item.Mockup />
                  </div>
                </div>
              ))}
            </div>

            {/* Secondary capabilities */}
            <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-border bg-surface p-6 transition hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${ACCENT_TILE[feature.accent]}`}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-t border-border">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Simple pricing that grows with you
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Start free and upgrade when your club is ready. Every plan
                includes the core tools your archers rely on.
              </p>
            </div>

            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-2xl border bg-surface p-8 ${
                    plan.highlight
                      ? "border-gold-400 shadow-md ring-1 ring-gold-400"
                      : "border-border"
                  }`}
                >
                  {plan.highlight ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-400 px-3 py-1 text-xs font-semibold text-ink-900 shadow-sm">
                      Most popular
                    </span>
                  ) : null}
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {plan.cadence}
                    </span>
                  </div>
                  {plan.inherits ? (
                    <p className="mt-6 text-sm font-medium text-foreground">
                      Everything in {plan.inherits}, plus:
                    </p>
                  ) : null}
                  <ul className="mt-4 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                        <span className="text-foreground/90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {authEnabled ? (
                    <Link
                      href="/login"
                      className={`mt-8 px-4 py-2.5 text-sm ${
                        plan.highlight ? buttonPrimary : buttonSecondary
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  ) : null}
                  <InterestForm
                    label={authEnabled ? "Interested?" : plan.cta}
                    className={`${authEnabled ? "mt-3" : "mt-8"} px-4 py-2.5 text-sm ${
                      plan.highlight ? buttonPrimary : buttonSecondary
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Add-ons */}
            <div className="mt-10">
              <h3 className="text-center text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                Add-ons
              </h3>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:mx-auto lg:max-w-4xl">
                {ADDONS.map((addon) => (
                  <div
                    key={addon.name}
                    className="rounded-2xl border border-border bg-surface p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-lg font-semibold">{addon.name}</h4>
                        <p className="mt-1 text-xs font-medium text-gold-600">
                          {addon.requires}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-2xl font-semibold tracking-tight">
                          {addon.price}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {addon.cadence}
                        </span>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {addon.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ — also emitted as FAQPage structured data below */}
        <section id="faq" className="border-t border-border bg-muted">
          <div className="mx-auto w-full max-w-3xl px-6 py-20 lg:py-24">
            <div className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Frequently asked questions
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to know about running your club on Anchor.
              </p>
            </div>
            <div className="mt-12 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
              {FAQ.map((item) => (
                <details key={item.q} className="group px-6 py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-medium text-foreground">
                    {item.q}
                    <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-24">
          <div className="relative overflow-hidden rounded-3xl bg-ink-900 px-8 py-16 text-center">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(255,210,87,0.22),transparent)]"
            />
            <div className="relative mx-auto max-w-2xl">
              <TargetMark className="mx-auto h-10 w-10 text-ink-50" />
              <h2 className="mt-6 text-3xl font-semibold tracking-tight text-ink-50 sm:text-4xl">
                Ready to bring your club together?
              </h2>
              <p className="mt-4 text-lg text-ink-300">
                Create your organization in minutes and give your archers a home
                worth showing up for.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                {authEnabled ? (
                  <Link href="/login" className={`${buttonPrimary} px-6 py-3 text-sm`}>
                    Create your organization
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                ) : null}
                <InterestForm
                  className={`${
                    authEnabled ? buttonSecondary : buttonPrimary
                  } px-6 py-3 text-sm`}
                />
              </div>
            </div>
          </div>
        </section>
    </>
  );
}
