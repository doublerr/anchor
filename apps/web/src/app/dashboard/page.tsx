import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TargetMark } from "@/components/marketing/icons";
import { buttonSecondary } from "@/components/ui/button-styles";

export const metadata = {
  title: "Dashboard · Anchor",
};

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The proxy already guards this route; this is a defensive fallback.
  if (!user) {
    redirect("/login");
  }

  // RLS ensures this only ever returns the signed-in user's own profile row.
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, updated_at")
    .eq("id", user.id)
    .single();

  // The organizations this user is a member of, with their role. RLS scopes
  // this to memberships that belong to the signed-in user.
  const { data: memberships } = await supabase
    .from("organization_members")
    .select("member_role, organizations (name)")
    .eq("profile_id", user.id);

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col bg-muted">
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
        <span className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <TargetMark className="h-6 w-6 text-foreground" />
          Anchor
        </span>
        <form action={signOut}>
          <button className={`${buttonSecondary} px-3 py-1.5 text-sm`}>
            Sign out
          </button>
        </form>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="mt-2 text-muted-foreground">
          You are signed in. This page talks directly to Supabase — the profile
          below is read under Row Level Security, so you can only ever see your
          own row.
        </p>

        <dl className="mt-8 grid gap-4 rounded-xl border border-border bg-surface p-6 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">User ID</dt>
            <dd className="mt-1 font-mono text-foreground">{user.id}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="mt-1 text-foreground">{user.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Profile full name</dt>
            <dd className="mt-1 text-foreground">{profile?.full_name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Phone</dt>
            <dd className="mt-1 text-foreground">{profile?.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Profile updated</dt>
            <dd className="mt-1 text-foreground">
              {profile?.updated_at
                ? new Date(profile.updated_at).toLocaleString()
                : "—"}
            </dd>
          </div>
        </dl>

        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Your organizations
          </h2>
          {memberships && memberships.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-3">
              {memberships.map((m, i) => {
                // Supabase types a joined relation as an array; this is a
                // to-one relation, so take the first row.
                const rel = m.organizations as
                  | { name: string }
                  | { name: string }[]
                  | null;
                const org = Array.isArray(rel) ? rel[0] : rel;
                return (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface px-6 py-4"
                  >
                    <span className="font-medium text-foreground">
                      {org?.name ?? "—"}
                    </span>
                    <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-ink-900 dark:bg-gold-400/20 dark:text-gold-200">
                      {m.member_role}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              You aren&rsquo;t part of an organization yet.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
