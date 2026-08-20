import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

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
      <SiteHeader signedIn={signedIn} authEnabled={authEnabled} />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </div>
  );
}
