import { createClient } from "@supabase/supabase-js";
import { getAdminSupabaseEnv } from "@/lib/supabase-env";

export function createSupabaseAdminClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = getAdminSupabaseEnv();

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false
    }
  });
}
