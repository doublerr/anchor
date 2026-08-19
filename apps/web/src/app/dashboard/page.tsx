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
    .select("full_name, updated_at")
    .eq("id", user.id)
    .single();

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
            <dt className="text-muted-foreground">Profile updated</dt>
            <dd className="mt-1 text-foreground">
              {profile?.updated_at
                ? new Date(profile.updated_at).toLocaleString()
                : "—"}
            </dd>
          </div>
        </dl>
      </main>
    </div>
  );
}
