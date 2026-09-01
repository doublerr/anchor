import type { ReactNode } from "react";
import Link from "next/link";
import { buttonPrimary, buttonSecondary } from "@/components/ui/button-styles";
import { TargetMark, MapPinIcon } from "@/components/marketing/icons";
import { ThemeToggle } from "@/components/public-site/theme-toggle";
import type {
  PublicSite,
  PublicLocation,
  PublicTeamMember,
} from "@/lib/public-site";
import type { OrgMemberRole, Program, SocialLinks } from "@/lib/org";

/** Public-facing labels for member roles shown in the Team section. */
const ROLE_LABELS: Record<OrgMemberRole, string> = {
  admin: "Administrator",
  instructor: "Instructor",
  archer: "Archer", // never shown publicly; here for completeness
};

/* ------------------------------- utilities ------------------------------- */

/** Join address parts into one line, dropping blanks. */
function formatAddress(parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join(", ");
}

/** Non-empty array or null. */
function list<T>(v: T[] | null | undefined): T[] | null {
  return v && v.length > 0 ? v : null;
}

/**
 * A keyless Google Maps embed URL for a location — prefers coordinates, falls
 * back to the address string. `output=embed` needs no API key. Returns null
 * when there's nothing to locate.
 */
function mapEmbedSrc(
  lat: number | null,
  lng: number | null,
  address: string,
): string | null {
  const q =
    lat != null && lng != null
      ? `${lat},${lng}`
      : address.trim()
        ? address.trim()
        : null;
  if (!q) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`;
}

/* ----------------------------- section shell ----------------------------- */

export function Section({
  id,
  title,
  children,
  tinted,
}: {
  id?: string;
  title?: string;
  children: ReactNode;
  tinted?: boolean;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-16 ${tinted ? "bg-muted/40" : ""}`}
    >
      <div className="mx-auto w-full max-w-5xl px-4 py-14 md:px-6 md:py-20">
        {title ? (
          <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {title}
          </h2>
        ) : null}
        {children}
      </div>
    </section>
  );
}

/* -------------------------------- sections ------------------------------- */

function Hero({ site }: { site: PublicSite }) {
  return (
    <section id="top" className="relative overflow-hidden border-b border-border">
      {site.hero_image_url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={site.hero_image_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-ink-900/60" />
        </>
      ) : (
        <div className="absolute inset-0 bg-surface" />
      )}
      <div
        className={`relative mx-auto flex w-full max-w-5xl flex-col items-center gap-5 px-4 py-20 text-center md:px-6 md:py-28 ${
          site.hero_image_url ? "text-white" : "text-foreground"
        }`}
      >
        {site.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={site.logo_url}
            alt={`${site.name} logo`}
            className="h-20 w-20 rounded-xl bg-surface object-cover shadow-sm"
          />
        ) : (
          <TargetMark className="h-16 w-16 text-current" />
        )}
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
          {site.name}
        </h1>
        {site.tagline ? (
          <p
            className={`max-w-2xl text-lg md:text-xl ${
              site.hero_image_url ? "text-white/90" : "text-muted-foreground"
            }`}
          >
            {site.tagline}
          </p>
        ) : null}
        {site.cta_url && site.cta_label ? (
          <a
            href={site.cta_url}
            className={`${buttonPrimary} mt-2 px-6 py-3 text-base`}
          >
            {site.cta_label}
          </a>
        ) : null}
      </div>
    </section>
  );
}

function Notice({ site }: { site: PublicSite }) {
  const hasCta = Boolean(site.cta_url && site.cta_label);
  if (!site.announcement?.trim() && !hasCta) return null;
  return (
    <div className="bg-gold-100 text-ink-900 dark:bg-gold-400/15 dark:text-gold-100">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-3 text-center text-sm font-medium md:px-6">
        {site.announcement ? <span>{site.announcement}</span> : null}
        {hasCta ? (
          <a
            href={site.cta_url!}
            className="inline-flex shrink-0 items-center justify-center rounded-md bg-ink-900 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-ink-800 dark:bg-gold-400 dark:text-ink-900 dark:hover:bg-gold-300"
          >
            {site.cta_label}
          </a>
        ) : null}
      </div>
    </div>
  );
}

function About({
  site,
  hasAboutPage,
}: {
  site: PublicSite;
  hasAboutPage: boolean;
}) {
  const body = site.about?.trim() || site.description?.trim();
  const highlights = list(site.highlights);
  if (!body && !highlights && !site.founded_year && !hasAboutPage) return null;
  return (
    <Section id="about" title="About">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        {site.founded_year ? (
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold-600 dark:text-gold-400">
            Established {site.founded_year}
          </p>
        ) : null}
        {body ? (
          <p className="whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
            {body}
          </p>
        ) : null}
        {hasAboutPage ? (
          <Link
            href={`/${site.slug}/about`}
            className={`${buttonSecondary} mt-6 px-5 py-2.5 text-sm`}
          >
            Learn more about us →
          </Link>
        ) : null}
      </div>
      {highlights ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {highlights.map((h, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-surface p-6 text-center"
            >
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {h.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{h.label}</p>
            </div>
          ))}
        </div>
      ) : null}
    </Section>
  );
}

/** First initial of a name, for the avatar fallback. */
function initial(name: string | null): string {
  return name?.trim()?.[0]?.toUpperCase() ?? "";
}

/** The grid of team-member cards, reused on the home page and the About page. */
export function TeamGrid({ team }: { team: PublicTeamMember[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {team.map((m) => (
        <div
          key={m.profile_id}
          className="flex flex-col items-center rounded-xl border border-border bg-surface p-6 text-center"
        >
          {m.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={m.avatar_url}
              alt={m.full_name ?? ""}
              className="mb-4 h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <span className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted text-2xl font-semibold text-muted-foreground">
              {initial(m.full_name) || (
                <TargetMark className="h-10 w-10 text-muted-foreground" />
              )}
            </span>
          )}
          <p className="text-lg font-semibold text-foreground">
            {m.full_name ?? "Team member"}
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gold-600 dark:text-gold-400">
            {ROLE_LABELS[m.member_role]}
          </p>
        </div>
      ))}
    </div>
  );
}

function Team({ team }: { team: PublicTeamMember[] }) {
  if (team.length === 0) return null;
  return (
    <Section id="team" title="Our team" tinted>
      <TeamGrid team={team} />
    </Section>
  );
}

/** The grid of program cards, reused on the home page and the Programs page. */
export function ProgramsGrid({ programs }: { programs: Program[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {programs.map((p, i) => (
        <div
          key={i}
          className="flex flex-col rounded-xl border border-border bg-surface p-6"
        >
          {p.audience ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 dark:text-gold-400">
              {p.audience}
            </p>
          ) : null}
          <p className="mt-1 text-lg font-semibold text-foreground">{p.name}</p>
          {p.blurb ? (
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              {p.blurb}
            </p>
          ) : null}
          {p.cta_url && p.cta_label ? (
            <a
              href={p.cta_url}
              className="mt-4 inline-flex text-sm font-semibold text-gold-700 hover:underline dark:text-gold-300"
            >
              {p.cta_label} →
            </a>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function Programs({ site }: { site: PublicSite }) {
  const programs = list(site.programs);
  if (!programs) return null;
  return (
    <Section id="programs" title="Programs">
      <ProgramsGrid programs={programs} />
      <div className="mt-8 text-center">
        <Link
          href={`/${site.slug}/programs`}
          className={`${buttonSecondary} px-5 py-2.5 text-sm`}
        >
          See all programs →
        </Link>
      </div>
    </Section>
  );
}

function Schedule({ site }: { site: PublicSite }) {
  if (!site.schedule_url?.trim()) return null;
  return (
    <Section id="schedule" title="Schedule" tinted>
      <div className="text-center">
        <p className="mb-6 text-muted-foreground">
          See upcoming classes and open range times.
        </p>
        <a
          href={site.schedule_url}
          className={`${buttonPrimary} px-6 py-3 text-base`}
        >
          View the schedule
        </a>
      </div>
    </Section>
  );
}

function Pricing({ site }: { site: PublicSite }) {
  const pricing = list(site.pricing);
  if (!pricing) return null;
  return (
    <Section id="pricing" title="Pricing">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pricing.map((p, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-surface p-6 text-center"
          >
            <p className="text-lg font-semibold text-foreground">{p.name}</p>
            {p.price ? (
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                {p.price}
                {p.cadence ? (
                  <span className="text-base font-normal text-muted-foreground">
                    {" "}
                    {p.cadence}
                  </span>
                ) : null}
              </p>
            ) : null}
            {p.note ? (
              <p className="mt-3 text-sm text-muted-foreground">{p.note}</p>
            ) : null}
          </div>
        ))}
      </div>
    </Section>
  );
}

function Events({ site }: { site: PublicSite }) {
  const events = list(site.events);
  if (!events) return null;
  return (
    <Section id="events" title="Events & Clinics" tinted>
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {events.map((e, i) => (
          <div
            key={i}
            className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-lg font-semibold text-foreground">{e.title}</p>
              {e.date ? (
                <p className="text-sm font-medium text-gold-700 dark:text-gold-300">
                  {e.date}
                </p>
              ) : null}
            </div>
            {e.blurb ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {e.blurb}
              </p>
            ) : null}
            {e.url ? (
              <a
                href={e.url}
                className="mt-1 inline-flex text-sm font-semibold text-gold-700 hover:underline dark:text-gold-300"
              >
                Learn more →
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </Section>
  );
}

function Testimonials({ site }: { site: PublicSite }) {
  const testimonials = list(site.testimonials);
  if (!testimonials) return null;
  return (
    <Section id="testimonials" title="What members say">
      <div className="grid gap-6 md:grid-cols-2">
        {testimonials.map((t, i) => (
          <figure
            key={i}
            className="flex flex-col rounded-xl border border-border bg-surface p-6"
          >
            <blockquote className="flex-1 text-lg leading-relaxed text-foreground">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            {t.author ? (
              <figcaption className="mt-4 text-sm font-medium text-muted-foreground">
                — {t.author}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </Section>
  );
}

function Gallery({ site }: { site: PublicSite }) {
  const gallery = list(site.gallery);
  if (!gallery) return null;
  return (
    <Section id="gallery" title="Gallery" tinted>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {gallery.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt=""
            className="aspect-square w-full rounded-xl object-cover"
          />
        ))}
      </div>
    </Section>
  );
}

function LocationCard({
  name,
  primary,
  address,
  mapsUrl,
  instructions,
  lat,
  lng,
}: {
  name: string;
  primary?: boolean;
  address: string;
  mapsUrl: string | null;
  instructions?: string | null;
  lat: number | null;
  lng: number | null;
}) {
  const embed = mapEmbedSrc(lat, lng, address);
  // Prefer the club's own maps link for "directions"; else a maps search.
  const directionsHref =
    mapsUrl ||
    (embed
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          lat != null && lng != null ? `${lat},${lng}` : address,
        )}`
      : null);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
      {embed ? (
        <iframe
          src={embed}
          title={`Map of ${name}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="aspect-video w-full border-0"
        />
      ) : null}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 rounded-lg bg-gold-100 p-2 text-ink-900 dark:bg-gold-400/15 dark:text-gold-100">
            <MapPinIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-semibold text-foreground">
              {name}
              {primary ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Primary
                </span>
              ) : null}
            </p>
            {address ? (
              <p className="text-sm text-muted-foreground">{address}</p>
            ) : null}
          </div>
        </div>
        {instructions ? (
          <p className="mt-3 text-sm text-muted-foreground">{instructions}</p>
        ) : null}
        {directionsHref ? (
          <a
            href={directionsHref}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex text-sm font-semibold text-gold-700 hover:underline dark:text-gold-300"
          >
            Get directions →
          </a>
        ) : null}
      </div>
    </div>
  );
}

function Locations({
  site,
  locations,
}: {
  site: PublicSite;
  locations: PublicLocation[];
}) {
  const primaryAddress = formatAddress([
    site.address_line1,
    site.city,
    site.region,
    site.postal_code,
    site.country,
  ]);
  const hasPrimary = Boolean(primaryAddress || site.google_maps_url);
  if (!hasPrimary && locations.length === 0) return null;
  return (
    <Section id="visit" title="Visit us">
      <div className="grid gap-6 md:grid-cols-2">
        {hasPrimary ? (
          <LocationCard
            name={site.name}
            primary
            address={primaryAddress}
            mapsUrl={site.google_maps_url}
            lat={site.latitude}
            lng={site.longitude}
          />
        ) : null}
        {locations.map((loc) => (
          <LocationCard
            key={loc.id}
            name={loc.name}
            address={formatAddress([
              loc.address_line1,
              loc.city,
              loc.region,
              loc.postal_code,
              loc.country,
            ])}
            mapsUrl={loc.google_maps_url}
            instructions={loc.special_instructions}
            lat={loc.latitude}
            lng={loc.longitude}
          />
        ))}
      </div>
    </Section>
  );
}

function Faqs({ site }: { site: PublicSite }) {
  const faqs = list(site.faqs);
  if (!faqs) return null;
  return (
    <Section id="faq" title="Frequently asked questions" tinted>
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {faqs.map((f, i) => (
          <details
            key={i}
            className="group rounded-xl border border-border bg-surface p-5"
          >
            <summary className="cursor-pointer list-none font-medium text-foreground">
              {f.q}
            </summary>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {f.a}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}

const SOCIAL_LABELS: [keyof SocialLinks, string][] = [
  ["facebook", "Facebook"],
  ["instagram", "Instagram"],
  ["youtube", "YouTube"],
  ["tiktok", "TikTok"],
  ["x", "X"],
];

function Contact({ site }: { site: PublicSite }) {
  const socials = SOCIAL_LABELS.filter(
    ([k]) => site.social_links?.[k]?.trim(),
  );
  const hasContact = Boolean(
    site.contact_name || site.email || site.phone || site.website,
  );
  if (!hasContact && socials.length === 0) return null;
  return (
    <Section id="contact" title="Get in touch">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
        {site.contact_name ? (
          <p className="text-lg font-semibold text-foreground">
            {site.contact_name}
            {site.contact_title ? (
              <span className="font-normal text-muted-foreground">
                {" "}
                · {site.contact_title}
              </span>
            ) : null}
          </p>
        ) : null}
        <div className="flex flex-col gap-1 text-muted-foreground">
          {site.email ? (
            <a href={`mailto:${site.email}`} className="hover:text-foreground">
              {site.email}
            </a>
          ) : null}
          {site.phone ? (
            <a href={`tel:${site.phone}`} className="hover:text-foreground">
              {site.phone}
            </a>
          ) : null}
          {site.website ? (
            <a
              href={site.website}
              className="hover:text-foreground"
              target="_blank"
              rel="noreferrer"
            >
              {site.website.replace(/^https?:\/\//, "")}
            </a>
          ) : null}
        </div>
        {socials.length > 0 ? (
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {socials.map(([k, label]) => (
              <a
                key={k}
                href={site.social_links?.[k]}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground hover:border-gold-400"
              >
                {label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </Section>
  );
}

/* -------------------------------- header --------------------------------- */

/** A header nav entry: an in-page anchor, or an explicit `href` (e.g. a sub-page). */
type NavItem = { id: string; label: string; href?: string };

/** Which sections the header should list, in order. */
export function navSections(
  site: PublicSite,
  locations: PublicLocation[],
  team: PublicTeamMember[],
): NavItem[] {
  const primaryPresent = Boolean(
    formatAddress([site.address_line1, site.city, site.region]) ||
      site.google_maps_url,
  );
  const hasAboutPage = hasAboutPageContent(site, team);
  const hasHomeAbout = Boolean(
    site.about || site.description || site.founded_year || list(site.highlights),
  );
  const hasPrograms = Boolean(list(site.programs));
  // About and Programs link to their dedicated sub-pages when they have content.
  const candidates: [boolean, string, string, string?][] = [
    [hasHomeAbout || hasAboutPage, "about", "About", hasAboutPage ? `/${site.slug}/about` : undefined],
    [hasPrograms, "programs", "Programs", hasPrograms ? `/${site.slug}/programs` : undefined],
    [team.length > 0, "team", "Team"],
    [Boolean(site.schedule_url), "schedule", "Schedule"],
    [Boolean(list(site.pricing)), "pricing", "Pricing"],
    [Boolean(list(site.events)), "events", "Events"],
    [Boolean(list(site.gallery)), "gallery", "Gallery"],
    [primaryPresent || locations.length > 0, "visit", "Visit"],
    [Boolean(list(site.faqs)), "faq", "FAQ"],
  ];
  return candidates
    .filter(([present]) => present)
    .map(([, id, label, href]) => ({ id, label, href }));
}

/**
 * The club's sticky header. `hrefBase` prefixes the section anchors: "" on the
 * home page (`#about`), or `/{slug}` on a sub-page so links jump back to the
 * home page's sections (`/{slug}#about`). The brand links home either way.
 */
export function SiteHeader({
  site,
  sections,
  hrefBase = "",
}: {
  site: PublicSite;
  sections: NavItem[];
  hrefBase?: string;
}) {
  const brandHref = hrefBase || "#top";
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 md:px-6">
        <a href={brandHref} className="flex min-w-0 items-center gap-2">
          {site.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={site.logo_url}
              alt={`${site.name} logo`}
              className="h-9 w-9 shrink-0 rounded-md object-cover"
            />
          ) : (
            <TargetMark className="h-8 w-8 shrink-0 text-foreground" />
          )}
          <span className="truncate text-base font-semibold tracking-tight text-foreground">
            {site.name}
          </span>
        </a>

        <div className="flex items-center gap-4">
          {sections.length > 0 ? (
            <nav className="hidden items-center gap-5 md:flex">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={s.href ?? `${hrefBase}#${s.id}`}
                  className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

/* --------------------------------- root ---------------------------------- */

/** Whether the About sub-page has anything to show (drives the home button). */
export function hasAboutPageContent(
  site: PublicSite,
  team: PublicTeamMember[],
): boolean {
  return Boolean(
    site.mission?.trim() ||
      site.method?.trim() ||
      site.facilities?.trim() ||
      team.length > 0,
  );
}

/**
 * The standard-design public club site. A sticky header links to whichever
 * sections exist, then every section renders in a fixed order — each returns
 * null when the club has no data for it, so a bare club shows a tidy Hero +
 * Contact and a detailed one shows the full page.
 */
export function ClubSite({
  site,
  locations,
  team,
}: {
  site: PublicSite;
  locations: PublicLocation[];
  team: PublicTeamMember[];
}) {
  return (
    <>
      <SiteHeader site={site} sections={navSections(site, locations, team)} />
      <Notice site={site} />
      <Hero site={site} />
      <About site={site} hasAboutPage={hasAboutPageContent(site, team)} />
      <Team team={team} />
      <Programs site={site} />
      <Schedule site={site} />
      <Pricing site={site} />
      <Events site={site} />
      <Testimonials site={site} />
      <Gallery site={site} />
      <Locations site={site} locations={locations} />
      <Faqs site={site} />
      <Contact site={site} />
    </>
  );
}
