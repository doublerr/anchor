import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "./config";

/**
 * Supabase client for use in Server Components, Server Actions, and Route
 * Handlers. Reads/writes the auth session from cookies. Access is governed
 * by RLS, so the signed-in user only ever sees their own rows.
 *
 * `cookies()` is async in Next.js 16, hence the `await`.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = supabaseEnv();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // `setAll` was called from a Server Component, where writing
          // cookies is not allowed. Safe to ignore — the proxy refreshes
          // the session on every request.
        }
      },
    },
  });
}
