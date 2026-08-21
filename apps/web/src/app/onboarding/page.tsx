import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminOrg } from "@/lib/org";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata = {
  title: "Set up your organization · Anchor",
};

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { org, isComplete } = await getAdminOrg(supabase, user.id);

  // No org yet — send them to create one first.
  if (!org) redirect("/create-organization");
  // Already finished onboarding — go to the portal.
  if (isComplete) redirect("/dashboard");

  // Prefill the phone from the profile if the org doesn't have one yet.
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-full flex-1 justify-center bg-muted px-4 py-10">
      <OnboardingWizard
        initial={{
          name: org.name ?? "",
          slug: org.slug ?? "",
          url_type: org.url_type ?? "anchor_path",
          description: org.description ?? "",
          website: org.website ?? "",
          logo_url: org.logo_url ?? "",
          address_line1: org.address_line1 ?? "",
          address_line2: org.address_line2 ?? "",
          city: org.city ?? "",
          region: org.region ?? "",
          postal_code: org.postal_code ?? "",
          country: org.country ?? "",
          phone: org.phone ?? profile?.phone ?? "",
          email: org.email ?? user.email ?? "",
          contact_name: org.contact_name ?? profile?.full_name ?? "",
          contact_title: org.contact_title ?? "",
          timezone: org.timezone ?? "",
          currency: org.currency ?? "USD",
          google_maps_url: org.google_maps_url ?? "",
          latitude: org.latitude ?? null,
          longitude: org.longitude ?? null,
          google_place_id: org.google_place_id ?? "",
        }}
        orgId={org.id}
      />
    </div>
  );
}
