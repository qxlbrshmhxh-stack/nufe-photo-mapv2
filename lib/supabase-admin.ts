import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assertSupabaseEnv() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
    );
  }
}

function assertSupabaseAdminEnv() {
  assertSupabaseEnv();

  if (!supabaseServiceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local. Keep this available for future server-admin tasks."
    );
  }
}

export function createSupabaseAdminClient() {
  assertSupabaseAdminEnv();

  return createClient(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: {
      persistSession: false
    }
  });
}
