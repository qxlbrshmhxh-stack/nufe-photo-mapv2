import { Profile } from "@/lib/types";

export function ProfileHeader({
  profile,
  uploadsCount,
  favoritesCount
}: {
  profile: Profile;
  uploadsCount: number;
  favoritesCount: number;
}) {
  return (
    <section className="rounded-[32px] border border-ink/10 bg-ink p-8 text-white shadow-soft">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div
          className="h-20 w-20 rounded-[24px] bg-cover bg-center"
          style={{
            backgroundImage: profile.avatar_url
              ? `linear-gradient(135deg, rgba(18,33,23,0.15), rgba(18,33,23,0.15)), url(${profile.avatar_url})`
              : "linear-gradient(135deg, rgba(244,230,204,0.9), rgba(238,244,235,0.7))"
          }}
        />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sand/80">Profile</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">{profile.nickname}</h1>
          <p className="mt-2 text-sm text-white/72">
            {uploadsCount} uploaded photo{uploadsCount === 1 ? "" : "s"} and {favoritesCount} saved spot
            {favoritesCount === 1 ? "" : "s"} in this account.
          </p>
          {profile.bio ? <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68">{profile.bio}</p> : null}
          {profile.email ? <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/55">{profile.email}</p> : null}
        </div>
      </div>
    </section>
  );
}
