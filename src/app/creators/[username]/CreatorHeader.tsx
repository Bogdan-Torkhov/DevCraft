"use client";

import { useState } from "react";
import { Edit3, Globe, Layers, Star, Eye, Calendar, Sparkles } from "lucide-react";
import { GithubIcon } from "@/components/Icons";
import { DbUser } from "@/lib/db";
import EditProfileModal from "@/components/EditProfileModal";

interface CreatorHeaderProps {
  user: Omit<DbUser, "password_hash">;
  isOwner: boolean;
  projectsCount: number;
  totalStarsReceived: number;
  totalViews: number;
}

export default function CreatorHeader({
  user,
  isOwner,
  projectsCount,
  totalStarsReceived,
  totalViews,
}: CreatorHeaderProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#111422] to-[#0c0e17] p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            {/* Creator Avatar with glow */}
            <div className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                alt={user.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white/10 shadow-xl group-hover:border-violet-500/50 transition-colors"
              />
              {isOwner && (
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white shadow-lg transition-transform hover:scale-110"
                  title="Change avatar"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{user.name}</h1>
                {isOwner && (
                  <span className="px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 text-[10px] font-semibold">
                    You
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="text-violet-400 font-mono font-semibold">@{user.username}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 font-medium">{user.role}</span>
              </div>
            </div>
          </div>

          {/* Social Links & Edit Button */}
          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
            {user.website_url && (
              <a
                href={user.website_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Website</span>
              </a>
            )}
            {user.github_url && (
              <a
                href={user.github_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                <GithubIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>GitHub</span>
              </a>
            )}

            {isOwner && (
              <button
                onClick={() => setIsEditOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/25 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Dedicated "About Me" Section */}
        <div className="mt-6 pt-5 border-t border-white/[0.06] space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-violet-400 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>About Me</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl whitespace-pre-line font-normal">
            {user.bio || "Creator sharing innovative code components and design experiments on DevCraft."}
          </p>
        </div>

        {/* Metrics Bar */}
        <div className="mt-6 pt-5 border-t border-white/[0.06] flex flex-wrap items-center gap-8 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-400" />
            <span className="font-bold text-white text-sm">{projectsCount}</span>
            <span>Creations</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white text-sm">{totalStarsReceived}</span>
            <span>Stars Earned</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white text-sm">{totalViews}</span>
            <span>Views</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar className="w-4 h-4" />
            <span>Joined DevCraft</span>
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
