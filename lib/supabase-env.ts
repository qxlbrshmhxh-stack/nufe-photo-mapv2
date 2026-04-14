type RuntimeEnvRecord = Record<string, string | undefined>;

const staticBrowserEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  emailRedirectPath: process.env.NEXT_PUBLIC_SUPABASE_EMAIL_REDIRECT_PATH
};

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

function getServerRuntimeEnv(name: string) {
  return getProcessEnv()?.[name] ?? getWorkerRuntimeEnv()?.[name];
}

function getEnvDiagnostics() {
  const processEnv = getProcessEnv();
  const workerEnv = getWorkerRuntimeEnv();

  return {
    processEnvAvailable: Boolean(processEnv),
    workerEnvAvailable: Boolean(workerEnv),
    hasSupabaseUrl: Boolean(
      getServerRuntimeEnv("SUPABASE_URL") ?? getServerRuntimeEnv("NEXT_PUBLIC_SUPABASE_URL")
    ),
    hasSupabaseAnonKey: Boolean(
      getServerRuntimeEnv("SUPABASE_ANON_KEY") ?? getServerRuntimeEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    ),
    hasSupabaseServiceRoleKey: Boolean(getServerRuntimeEnv("SUPABASE_SERVICE_ROLE_KEY")),
    hasStorageBucket: Boolean(getServerRuntimeEnv("SUPABASE_STORAGE_BUCKET"))
  };
}

export function getBrowserSupabaseEnv() {
  const { supabaseUrl, supabaseAnonKey } = staticBrowserEnv;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[supabase-env] Browser env missing", {
      helper: "getBrowserSupabaseEnv",
      hasSupabaseUrl: Boolean(supabaseUrl),
      hasSupabaseAnonKey: Boolean(supabaseAnonKey)
    });

    throw new Error(
      "Missing Supabase browser environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    siteUrl: staticBrowserEnv.siteUrl || "http://localhost:3000",
    emailRedirectPath: staticBrowserEnv.emailRedirectPath || "/auth/callback"
  };
}

export function getServerSupabaseEnv() {
  const supabaseUrl =
    getServerRuntimeEnv("SUPABASE_URL") ??
    getServerRuntimeEnv("NEXT_PUBLIC_SUPABASE_URL");

  const supabaseAnonKey =
    getServerRuntimeEnv("SUPABASE_ANON_KEY") ??
    getServerRuntimeEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[supabase-env] Server env missing", {
      helper: "getServerSupabaseEnv",
      ...getEnvDiagnostics()
    });

    throw new Error(
      "Missing Supabase server environment variables. Set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    storageBucket: getServerRuntimeEnv("SUPABASE_STORAGE_BUCKET") || "spot-photos"
  };
}

export function getAdminSupabaseEnv() {
  const supabaseUrl =
    getServerRuntimeEnv("SUPABASE_URL") ??
    getServerRuntimeEnv("NEXT_PUBLIC_SUPABASE_URL");

  const supabaseServiceRoleKey = getServerRuntimeEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("[supabase-env] Admin env missing", {
      helper: "getAdminSupabaseEnv",
      ...getEnvDiagnostics()
    });
  }

  if (!supabaseUrl) {
    throw new Error(
      "Missing Supabase admin environment variables. Set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL."
    );
  }

  if (!supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in environment variables.");
  }

  return {
    supabaseUrl,
    supabaseServiceRoleKey
  };
}

export function isBrowserSupabaseConfigured() {
  return Boolean(staticBrowserEnv.supabaseUrl && staticBrowserEnv.supabaseAnonKey);
}
