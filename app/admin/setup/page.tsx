import { requireAdmin } from "@/lib/auth";

const checklist = [
  "Add all required env vars in `.env.local`.",
  "Run the latest `supabase/schema.sql` migration in the Supabase SQL editor.",
  "Confirm the `spot-photos` public storage bucket exists.",
  "Enable Supabase Email auth and add the local redirect URL.",
  "Create the first admin account and at least one moderator account.",
  "Seed a small set of reviewed spots and featured photos before launch.",
  "Verify upload, favorite, report, moderation, merge, and maintenance flows locally.",
  "Review the moderation workflow with staff before opening submissions publicly."
];

export default async function AdminSetupPage() {
  await requireAdmin("/");

  return (
    <div className="space-y-6 rounded-[32px] border border-ink/10 bg-white/90 p-8 shadow-soft">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">Launch readiness</p>
        <h1 className="font-display text-4xl font-semibold">Pre-launch setup checklist</h1>
        <p className="max-w-3xl text-sm leading-6 text-ink/68">
          Use this page as the last internal pass before opening the product to real users.
        </p>
      </div>
      <div className="grid gap-3">
        {checklist.map((item) => (
          <div key={item} className="rounded-2xl bg-mist px-4 py-3 text-sm text-ink/72">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
