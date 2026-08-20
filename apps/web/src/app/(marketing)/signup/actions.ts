"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Organization signup. The person signing up here is setting up an
 * organization, so they become its admin: the `organization_name` in the
 * auth-user metadata drives the DB trigger (`public.handle_new_user`) to
 * create the organization + an `admin` membership in one transaction.
 *
 * Email-primary (verified via /auth/confirm); phone is optional and stored on
 * the profile as unverified contact info.
 */
export async function signup(formData: FormData) {
  const supabase = await createClient();

  const organizationName = String(formData.get("organization_name") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
    options: {
      // Stored on the auth user's metadata; the DB trigger reads it to
      // provision the profile, organization, and admin membership.
      data: {
        full_name: fullName,
        organization_name: organizationName,
        ...(phone ? { phone } : {}),
      },
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // When email confirmation is disabled, signUp returns a live session and the
  // user is already signed in — send them straight to the dashboard. When a
  // confirmation is still pending, there's no session yet, so tell them to
  // check their email.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  redirect(
    `/login?message=${encodeURIComponent(
      "Check your email to confirm your account, then sign in.",
    )}`,
  );
}
