import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminOrg } from "@/lib/org";
import { AppShell } from "@/components/app/app-shell";

/**
 * Authenticated app shell + onboarding hard gate. Any admin whose organization
 * has not finished onboarding is redirected to the wizard; everyone else gets
 * the portal chrome around their page. `/onboarding` lives outside this group,
 * so the redirect can't loop.
 */
export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defensive — the proxy already guards authenticated routes.
  if (!user) {
    redirect("/login");
  }

  const { org, isComplete } = await getAdminOrg(supabase, user.id);

  // No org (e.g. they deleted it) — send them to create one.
  if (!org) {
    redirect("/create-organization");
  }

  // Org admins must finish onboarding before reaching the portal.
  if (!isComplete) {
    redirect("/onboarding");
  }

  return (
    <AppShell orgName={org?.name ?? "Anchor"} logoUrl={org?.logo_url}>
      {children}
    </AppShell>
  );
}
