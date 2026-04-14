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

export function getPublicSupabaseEnv() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    getRuntimeEnv("NEXT_PUBLIC_SUPABASE_URL");

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    getRuntimeEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in environment variables."
    );
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    siteUrl:
      process.env.NEXT_PUBLIC_SITE_URL ??
      getRuntimeEnv("NEXT_PUBLIC_SITE_URL") ??
      "http://localhost:3000",
    emailRedirectPath:
      process.env.NEXT_PUBLIC_SUPABASE_EMAIL_REDIRECT_PATH ??
      getRuntimeEnv("NEXT_PUBLIC_SUPABASE_EMAIL_REDIRECT_PATH") ??
      "/auth/callback",
    storageBucket:
      process.env.SUPABASE_STORAGE_BUCKET ??
      getRuntimeEnv("SUPABASE_STORAGE_BUCKET") ??
      "spot-photos"
  };
}

export function isPublicSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
      getRuntimeEnv("NEXT_PUBLIC_SUPABASE_URL")
  ) && Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      getRuntimeEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}
