import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getServerSupabaseEnv } from "@/lib/supabase-env";

type RuntimeEnvRecord = Record<string, string | undefined>;

export async function createSupabaseServerClient() {
  const { supabaseUrl, supabaseAnonKey } = getServerSupabaseEnv();

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
  const globalScope = globalThis as typeof globalThis & {
    __env__?: RuntimeEnvRecord;
    CloudflareEnv?: RuntimeEnvRecord;
    env?: RuntimeEnvRecord;
  };

  return (
    process.env.SUPABASE_STORAGE_BUCKET ??
    globalScope.__env__?.SUPABASE_STORAGE_BUCKET ??
    globalScope.CloudflareEnv?.SUPABASE_STORAGE_BUCKET ??
    globalScope.env?.SUPABASE_STORAGE_BUCKET ??
    "spot-photos"
  );
}
