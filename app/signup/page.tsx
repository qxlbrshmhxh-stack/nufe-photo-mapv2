import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-xl rounded-[32px] border border-ink/10 bg-white/90 p-8 shadow-soft sm:p-10" />}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
