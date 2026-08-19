import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "./config";

/**
 * Supabase client for use in Client Components (browser).
 * Talks directly to Supabase — all access is governed by RLS.
 */
export function createClient() {
  const { url, key } = supabaseEnv();
  return createBrowserClient(url, key);
}
