import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./config";

/**
 * A session-less Supabase client for public reads (the club sites). It carries
 * no cookies, so it works during static generation / `generateStaticParams`
 * where the request scope — and `cookies()` — is unavailable. Access is still
 * governed by RLS + grants: it can only read the anon-granted public views.
 */
export function createPublicClient() {
  const { url, key } = supabaseEnv();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
