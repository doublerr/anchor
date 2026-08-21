"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminOrg } from "@/lib/org";
import { validateOrgName } from "@/lib/slug";

/**
 * Create a fresh organization for the signed-in user (they have an account but
 * no org). Delegates the multi-row bootstrap to the `create_organization`
 * SECURITY DEFINER RPC, then sends them into onboarding to fill in the details.
 */
export async function createOrganization(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // If they already administer an org, don't make a duplicate.
  const { org, isComplete } = await getAdminOrg(supabase, user.id);
  if (org) redirect(isComplete ? "/dashboard" : "/onboarding");

  const name = String(formData.get("organization_name") ?? "").trim();
  const nameError = validateOrgName(name);
  if (nameError) {
    redirect(`/create-organization?error=${encodeURIComponent(nameError)}`);
  }

  const { error } = await supabase.rpc("create_organization", {
    org_name: name,
  });
  if (error) {
    redirect(
      `/create-organization?error=${encodeURIComponent(
        `Could not create your organization: ${error.message}`,
      )}`,
    );
  }

  revalidatePath("/", "layout");
  redirect("/onboarding");
}
