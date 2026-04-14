import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getPublicSupabaseEnv } from "@/lib/supabase-env";

export async function createSupabaseServerClient() {
  const { supabaseUrl, supabaseAnonKey } = getPublicSupabaseEnv();

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          return;
        }
      }
    }
  });
}

export function getStorageBucketName() {
  return getPublicSupabaseEnv().storageBucket;
}
