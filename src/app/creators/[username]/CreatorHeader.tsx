"use client";

import { useState } from "react";
import { Edit3, Globe, Layers, Star, Eye, Calendar, Sparkles } from "lucide-react";
import { GithubIcon } from "@/components/Icons";
import { DbUser } from "@/lib/db";
import EditProfileModal from "@/components/EditProfileModal";
import Avatar from "@/components/Avatar";

interface CreatorHeaderProps {
  user: Omit<DbUser, "password_hash">;
  isOwner: boolean;
  projectsCount: number;
  totalStarsReceived: number;
  totalViews: number;
}

function isSafeUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function CreatorHeader({
  user,
  isOwner,
  projectsCount,
  totalStarsReceived,
  totalViews,
}: CreatorHeaderProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const formattedJoined = (() => {
    if (!user.created_at) return "Recently";
    try {
      const safe = user.created_at.includes("T")
        ? user.created_at
        : user.created_at.replace(" ", "T") + "Z";
      const d = new Date(safe);
      if (isNaN(d.getTime())) return "Recently";
      return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } catch {
      return "Recently";
    }
  })();

  return (
    <>
      <div className="glass-panel relative overflow-hidden rounded-3xl p-5 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />

        <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4 sm:items-center sm:gap-5">
            {/* Creator Avatar with glow */}
            <div className="relative group shrink-0">
              <div className="rounded-2xl bg-gradient-to-br from-violet-400 via-fuchsia-400 to-cyan-300 p-[2px] shadow-[0_0_35px_-12px_rgba(139,92,246,0.8)] transition-transform duration-300 group-hover:scale-[1.02]">
                <Avatar
                  src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                  name={user.name}
                  className="h-16 w-16 rounded-[14px] border border-[#0b0d17] object-cover sm:h-24 sm:w-24 sm:rounded-[18px]"
                  textClassName="text-xl sm:text-3xl"
                />
              </div>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setIsEditOpen(true)}
                  className="absolute -bottom-1.5 -right-1.5 rounded-lg border border-white/20 bg-violet-600 p-1.5 text-white shadow-lg transition-transform hover:scale-110 hover:bg-violet-500"
                  title="Change avatar"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-black tracking-tight text-white sm:text-4xl">{user.name}</h1>
                {isOwner && (
                  <span className="rounded-full border border-violet-400/30 bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-200">
                    You
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono font-semibold text-violet-300">@{user.username}</span>
                <span className="text-slate-600">•</span>
                <span className="font-medium text-slate-300">{user.role}</span>
              </div>
            </div>
          </div>

          {/* Social Links & Edit Button */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
            {isSafeUrl(user.website_url) && (
              <a
                href={user.website_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Website</span>
              </a>
            )}
            {isSafeUrl(user.github_url) && (
              <a
                href={user.github_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                <GithubIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>GitHub</span>
              </a>
            )}

            {isOwner && (
              <button
                onClick={() => setIsEditOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_25px_-10px_rgba(139,92,246,0.9)] ring-1 ring-inset ring-white/15 transition-all hover:from-violet-500 hover:to-indigo-400 hover:shadow-[0_10px_30px_-10px_rgba(139,92,246,1)] cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Dedicated "About Me" Section */}
        <div className="mt-6 space-y-2 border-t border-white/[0.06] pt-5">
          <div className="eyebrow flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            <span>About me</span>
          </div>
          <p className="max-w-3xl whitespace-pre-line break-words text-sm font-normal leading-relaxed text-slate-300">
            {user.bio || "Creator sharing innovative code components and design experiments on DevCraft."}
          </p>
        </div>

        {/* Metrics Bar */}
        <div className="mt-6 grid grid-cols-2 gap-2.5 border-t border-white/[0.06] pt-5 sm:grid-cols-4">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
              <Layers className="h-3.5 w-3.5 text-violet-300" />
              Creations
            </div>
            <div className="mt-1 font-mono text-lg font-extrabold text-white">{projectsCount}</div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
              <Star className="h-3.5 w-3.5 text-amber-300" />
              Stars
            </div>
            <div className="mt-1 font-mono text-lg font-extrabold text-white">{totalStarsReceived}</div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
              <Eye className="h-3.5 w-3.5 text-cyan-300" />
              Views
            </div>
            <div className="mt-1 font-mono text-lg font-extrabold text-white">{totalViews}</div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-fuchsia-300" />
              Joined
            </div>
            <div className="mt-1 font-mono text-lg font-extrabold text-white">{formattedJoined}</div>
          </div>
        </div>
      </div>

      {isEditOpen && (
        <EditProfileModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          user={user}
        />
      )}
    </>
  );
}
