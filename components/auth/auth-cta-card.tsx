import Link from "next/link";

export function AuthCtaCard({
  title,
  description,
  nextPath
}: {
  title: string;
  description: string;
  nextPath: string;
}) {
  return (
    <div className="rounded-[32px] border border-ink/10 bg-white/90 p-8 shadow-soft sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">Account required</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-ink/68">{description}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/login?next=${encodeURIComponent(nextPath)}`}
          className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-moss"
        >
          Log in
        </Link>
        <Link
          href={`/signup?next=${encodeURIComponent(nextPath)}`}
          className="inline-flex rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-moss/35 hover:text-moss"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
