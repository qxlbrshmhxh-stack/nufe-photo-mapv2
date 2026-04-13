import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

function assertSupabaseEnv() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
    );
  }
}

export function createSupabaseBrowserClient() {
  assertSupabaseEnv();

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  }

  return browserClient;
}

export function getSupabaseEnv() {
  assertSupabaseEnv();

  return {
    supabaseUrl: supabaseUrl!,
    supabaseAnonKey: supabaseAnonKey!,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    emailRedirectPath:
      process.env.NEXT_PUBLIC_SUPABASE_EMAIL_REDIRECT_PATH || "/auth/callback"
  };
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
