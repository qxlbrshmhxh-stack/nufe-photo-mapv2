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

function getAdminSupabaseEnv() {
  const supabaseUrl =
    getRuntimeEnv("SUPABASE_URL") ??
    getRuntimeEnv("NEXT_PUBLIC_SUPABASE_URL");

  const supabaseServiceRoleKey = getRuntimeEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl) {
    throw new Error(
      "Missing Supabase admin environment variables. Set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL."
    );
  }

  if (!supabaseServiceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY in environment variables."
    );
  }

  return { supabaseUrl, supabaseServiceRoleKey };
}

export function createSupabaseAdminClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = getAdminSupabaseEnv();

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false
    }
  });
}