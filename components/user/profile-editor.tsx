"use client";

import { FormEvent, useState } from "react";
import { siteConfig } from "@/lib/site-config";
import { Profile } from "@/lib/types";

export function ProfileEditor({
  profile,
  onProfileSaved
}: {
  profile: Profile;
  onProfileSaved: (profile: Profile) => void;
}) {
  const [nickname, setNickname] = useState(profile.nickname);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nickname,
          avatarUrl,
          bio
        })
      });

      const result = (await response.json()) as {
        success: boolean;
        profile?: Profile;
        message?: string;
      };

      if (!response.ok || !result.success || !result.profile) {
        throw new Error(result.message || "Failed to update profile.");
      }

      onProfileSaved(result.profile);
      setMessage({
        type: "success",
        text: "Profile updated."
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update profile."
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[30px] border border-ink/10 bg-white/90 p-6 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">Edit profile</p>
      <div className="mt-5 grid gap-4">
        <label className="space-y-2 text-sm font-medium text-ink">
          Nickname
          <input
            type="text"
            required
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none transition focus:border-moss"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-ink">
          Avatar URL
          <input
            type="url"
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            placeholder="https://..."
            className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none transition focus:border-moss"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-ink">
          Bio
          <textarea
            rows={4}
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder={siteConfig.user.bioPlaceholder}
            className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none transition focus:border-moss"
          />
        </label>
      </div>

      {message ? (
        <div
          className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSaving}
        className="mt-5 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSaving ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
