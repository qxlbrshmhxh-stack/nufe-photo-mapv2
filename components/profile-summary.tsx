import { Bookmark, ImageIcon, UserRound } from "lucide-react";
import { UserProfile } from "@/lib/types";

type ProfileSummaryProps = {
  user: UserProfile;
  uploadsCount: number;
  favoritesCount: number;
};

export function ProfileSummary({ user, uploadsCount, favoritesCount }: ProfileSummaryProps) {
  return (
    <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[32px] border border-ink/10 bg-ink p-8 text-white shadow-soft">
        <div className="flex items-center gap-4">
          <div
            className="h-20 w-20 rounded-[24px] bg-cover bg-center"
            style={{ backgroundImage: `url(${user.avatar_url})` }}
          />
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-sand/80">Profile</p>
            <h1 className="mt-2 font-display text-4xl font-semibold">{user.nickname}</h1>
            <p className="mt-2 text-sm text-white/70">Sharing favorite camera angles and seasonal campus scenes.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
        <StatCard icon={UserRound} label="Member Since" value={user.created_at.slice(0, 10)} />
        <StatCard icon={ImageIcon} label="Uploads" value={`${uploadsCount}`} />
        <StatCard icon={Bookmark} label="Saved Spots" value={`${favoritesCount}`} />
      </div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-[28px] border border-ink/10 bg-white/85 p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mist text-moss">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-ink/45">{label}</p>
          <p className="mt-1 text-lg font-semibold">{value}</p>
        </div>
      </div>
    </article>
  );
}
