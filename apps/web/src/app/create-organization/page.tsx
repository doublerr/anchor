import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminOrg } from "@/lib/org";
import { createOrganization } from "./actions";
import { TargetMark } from "@/components/marketing/icons";
import { buttonPrimary } from "@/components/ui/button-styles";
import { fieldClass, labelClass } from "@/components/ui/field-styles";

export const metadata = {
  title: "Create your organization · Anchor",
};

export default async function CreateOrganizationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Already have an org? Send them where they belong instead of creating one.
  const { org, isComplete } = await getAdminOrg(supabase, user.id);
  if (org) redirect(isComplete ? "/dashboard" : "/onboarding");

  return (
    <div className="flex flex-1 items-center justify-center bg-muted px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <TargetMark className="mx-auto h-10 w-10 text-foreground" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
            Create your organization
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You&rsquo;re signed in but don&rsquo;t have a club yet. Name it to get
            started — you&rsquo;ll add the details next.
          </p>
        </div>

        <form
          action={createOrganization}
          className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm"
        >
          {error ? (
            <p className="rounded-md bg-coral-100 px-3 py-2 text-sm text-coral-700 dark:bg-coral-400/15 dark:text-coral-300">
              {error}
            </p>
          ) : null}

          <label className={labelClass}>
            Organization name
            <input
              name="organization_name"
              type="text"
              required
              minLength={2}
              maxLength={100}
              autoFocus
              placeholder="e.g. Riverside Archery Club"
              className={fieldClass}
            />
          </label>

          <button className={`${buttonPrimary} mt-2 px-3 py-2 text-sm`}>
            Create organization
          </button>
        </form>
      </div>
    </div>
  );
}
