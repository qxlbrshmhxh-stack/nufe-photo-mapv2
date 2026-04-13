import { ReactNode } from "react";
import { requireStaff } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireStaff("/");

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-ink/10 bg-ink p-8 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sand/80">Admin</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Moderation and operations</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">
          Review new content, resolve reports, and keep the public campus map clean and reliable.
        </p>
        <div className="mt-6">
          <AdminNav role={profile.role} />
        </div>
      </section>
      {children}
    </div>
  );
}
