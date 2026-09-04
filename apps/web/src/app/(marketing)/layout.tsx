import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import {
  ORG_NAME,
  PRICING,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

/**
 * Structured data for Anchor itself: the organization, the website and the
 * product with its pricing tiers.
 *
 * Scoped to the marketing group rather than the root layout. It used to render
 * on every page in the app, which meant each club's public site also declared
 * itself to be Anchor's SaaS product, complete with per-month pricing offers —
 * exactly the wrong entity for a page whose whole job is to rank as a local
 * archery club. Club pages emit their own SportsActivityLocation instead
 * (see lib/club-seo.ts).
 */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: ORG_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/brand/icon-gold-512.png`,
      description: SITE_DESCRIPTION,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: SITE_NAME,
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Sports club management software",
      operatingSystem: "Web",
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
      offers: PRICING.map((tier) => ({
        "@type": "Offer",
        name: `${tier.name} plan`,
        price: tier.price,
        priceCurrency: "USD",
        category: tier.cadence,
      })),
    },
  ],
};

/**
 * Shell for the public / pre-login pages (landing, login, signup): standard
 * marketing header and footer around the page content. Post-login pages (the
 * dashboard) live outside this group and get their own app layout.
 */
export default async function MarketingLayout({
  children,
}: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const signedIn = Boolean(user);
  // Public sign-in / signup is gated to local dev for now; everyone else sees
  // the "Interested?" lead-capture flow instead.
  const authEnabled = process.env.NODE_ENV === "development";

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <script
        type="application/ld+json"
        // Structured data is trusted, build-time content — safe to inline.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SiteHeader signedIn={signedIn} authEnabled={authEnabled} />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </div>
  );
}
