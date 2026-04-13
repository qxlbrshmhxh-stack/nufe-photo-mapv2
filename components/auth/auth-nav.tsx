"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

export function AuthNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.refresh();
    if (pathname === "/user" || pathname === "/upload") {
      router.replace("/");
    }
  }

  if (isLoading) {
    return <div className="text-sm text-ink/55">Checking account...</div>;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={`/login?next=${encodeURIComponent(pathname || "/")}`}
          className="inline-flex items-center rounded-full border border-ink/10 bg-white/80 px-4 py-2 text-sm font-medium text-ink transition hover:border-fern/40 hover:text-moss"
        >
          Log in
        </Link>
        <Link
          href={`/signup?next=${encodeURIComponent(pathname || "/")}`}
          className="inline-flex items-center rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-moss"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/user"
        className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/80 px-4 py-2 text-sm font-medium text-ink transition hover:border-fern/40 hover:text-moss"
      >
        <UserRound className="h-4 w-4" />
        {user.email?.split("@")[0] || "My account"}
      </Link>
      <button
        type="button"
        onClick={handleSignOut}
        className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-coral/35 hover:text-coral"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );
}
