import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseEnv, isPublicSupabaseConfigured } from "@/lib/supabase-env";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  const { supabaseUrl, supabaseAnonKey } = getPublicSupabaseEnv();

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  }

  return browserClient;
}

export function getSupabaseEnv() {
  return getPublicSupabaseEnv();
}

export function isSupabaseConfigured() {
  return isPublicSupabaseConfigured();
}
