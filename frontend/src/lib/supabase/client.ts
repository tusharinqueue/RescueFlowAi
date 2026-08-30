import { createBrowserClient } from "@supabase/ssr";

/**
 * Returns a singleton Supabase browser client.
 * Returns null when Supabase is not configured (demo / local dev mode).
 * Safe to call multiple times – only one instance is created per page load.
 */
export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
  const supabaseAnonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

  if (!supabaseUrl || !supabaseAnonKey) {
    // Demo mode: Supabase not configured — return null
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
