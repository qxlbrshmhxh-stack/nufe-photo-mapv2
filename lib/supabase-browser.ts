import { createBrowserClient } from "@supabase/ssr";
import { getBrowserSupabaseEnv, isBrowserSupabaseConfigured } from "@/lib/supabase-env";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  const { supabaseUrl, supabaseAnonKey } = getBrowserSupabaseEnv();

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  }

  return browserClient;
}

export function getSupabaseEnv() {
  return getBrowserSupabaseEnv();
}

export function isSupabaseConfigured() {
  return isBrowserSupabaseConfigured();
}
