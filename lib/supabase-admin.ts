import { createClient } from "@supabase/supabase-js";

type RuntimeEnvRecord = Record<string, string | undefined>;

function getProcessEnv() {
  if (typeof process === "undefined") {
    return undefined;
  }

  return process.env as RuntimeEnvRecord;
}

function getWorkerRuntimeEnv() {
  const globalScope = globalThis as typeof globalThis & {
    __env__?: RuntimeEnvRecord;
    CloudflareEnv?: RuntimeEnvRecord;
    env?: RuntimeEnvRecord;
  };

  return globalScope.__env__ ?? globalScope.CloudflareEnv ?? globalScope.env;
}

function getRuntimeEnv(name: string) {
  return getProcessEnv()?.[name] ?? getWorkerRuntimeEnv()?.[name];
}

function assertSupabaseEnv() {
  const supabaseUrl = getRuntimeEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = getRuntimeEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in environment variables."
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

function assertSupabaseAdminEnv() {
  const { supabaseUrl } = assertSupabaseEnv();
  const supabaseServiceRoleKey = getRuntimeEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseServiceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY in environment variables."
    );
  }

  return { supabaseUrl, supabaseServiceRoleKey };
}

export function createSupabaseAdminClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = assertSupabaseAdminEnv();

  return createClient(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: {
      persistSession: false
    }
  });
}
