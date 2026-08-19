/**
 * Reads and validates the Supabase connection env vars.
 *
 * `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is Supabase's current key name (the
 * `sb_publishable_…` key that replaced the legacy anon key). Both are safe to
 * expose to the browser — access is still governed by Row Level Security.
 *
 * These are referenced as static `process.env.NEXT_PUBLIC_*` properties so
 * Next.js can inline them into the client bundle at build time.
 */
export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in apps/web/.env.local, then " +
        "restart the dev server.",
    );
  }

  return { url, key };
}
