import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
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
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Anchor
        </span>
        <form action={signOut}>
          <button className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900">
            Sign out
          </button>
        </form>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          You are signed in. This page talks directly to Supabase — the profile
          below is read under Row Level Security, so you can only ever see your
          own row.
        </p>

        <dl className="mt-8 grid gap-4 rounded-xl border border-zinc-200 bg-white p-6 text-sm dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-2">
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">User ID</dt>
            <dd className="mt-1 font-mono text-zinc-900 dark:text-zinc-100">
              {user.id}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Email</dt>
            <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
              {user.email}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">
              Profile full name
            </dt>
            <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
              {profile?.full_name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">
              Profile updated
            </dt>
            <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
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
