"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { siteConfig } from "@/lib/site-config";
import { AuthFormMode } from "@/lib/types";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

function buildRedirectUrl(nextPath: string) {
  const callbackPath =
    process.env.NEXT_PUBLIC_SUPABASE_EMAIL_REDIRECT_PATH || "/auth/callback";

  if (typeof window !== "undefined") {
    return `${window.location.origin}${callbackPath}?next=${encodeURIComponent(nextPath)}`;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${siteUrl}${callbackPath}?next=${encodeURIComponent(nextPath)}`;
}

export function AuthForm({ mode }: { mode: AuthFormMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/user";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const alternatePath = useMemo(
    () => (mode === "login" ? `/signup?next=${encodeURIComponent(nextPath)}` : `/login?next=${encodeURIComponent(nextPath)}`),
    [mode, nextPath]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          throw error;
        }

        router.replace(nextPath);
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: buildRedirectUrl(nextPath),
            data: {
              nickname: nickname.trim()
            }
          }
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          router.replace(nextPath);
          router.refresh();
          return;
        }

        setMessage({
          type: "success",
          text: "Account created. Check your email to confirm your address, then continue into the app."
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Authentication failed."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl rounded-[32px] border border-ink/10 bg-white/90 p-8 shadow-soft sm:p-10">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">
          {mode === "login" ? "Welcome back" : "Create account"}
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          {mode === "login" ? siteConfig.auth.loginTitle : siteConfig.auth.signupTitle}
        </h1>
        <p className="text-sm leading-6 text-ink/68">
          {mode === "login"
            ? siteConfig.auth.loginDescription
            : siteConfig.auth.signupDescription}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {mode === "signup" ? (
          <label className="block space-y-2 text-sm font-medium text-ink">
            Nickname
            <input
              type="text"
              required
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder={siteConfig.auth.nicknamePlaceholder}
              className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none transition focus:border-moss"
            />
          </label>
        ) : null}

        <label className="block space-y-2 text-sm font-medium text-ink">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={siteConfig.auth.emailPlaceholder}
            className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none transition focus:border-moss"
          />
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none transition focus:border-moss"
          />
        </label>

        {message ? (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting
            ? mode === "login"
              ? "Signing in..."
              : "Creating account..."
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink/65">
        {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
        <Link href={alternatePath} className="font-semibold text-coral">
          {mode === "login" ? "Sign up" : "Log in"}
        </Link>
      </p>
    </div>
  );
}
