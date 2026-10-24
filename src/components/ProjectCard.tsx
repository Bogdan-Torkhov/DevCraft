"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Star, MessageSquare, Eye, Play, Code2 } from "lucide-react";
import { ProjectWithAuthor } from "@/lib/db";
import { toggleStarAction } from "@/app/actions";

interface ProjectCardProps {
  project: ProjectWithAuthor;
  onRequireAuth?: () => void;
}

export default function ProjectCard({ project, onRequireAuth }: ProjectCardProps) {
  const [hasStarred, setHasStarred] = useState(project.has_starred ?? false);
  const [starsCount, setStarsCount] = useState(project.stars_count);
  const [isPending, startTransition] = useTransition();

  const handleStar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic toggle
    const nextStarred = !hasStarred;
    setHasStarred(nextStarred);
    setStarsCount((prev) => (nextStarred ? prev + 1 : Math.max(0, prev - 1)));

    startTransition(async () => {
      const res = await toggleStarAction(project.id);
      if ("error" in res && res.error) {
        // Revert if error
        setHasStarred(!nextStarred);
        setStarsCount(project.stars_count);
        if (onRequireAuth) onRequireAuth();
      } else if ("totalStars" in res && res.totalStars !== undefined) {
        setStarsCount(res.totalStars);
      }
    });
  };

  let tags: string[] = [];
  try {
    tags = JSON.parse(project.tags);
  } catch {
    tags = project.tags ? project.tags.split(",") : [];
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group relative">
      {/* Visual Cover / Preview Thumbnail */}
      <Link href={`/projects/${project.id}`} className="relative h-48 w-full overflow-hidden block bg-[#0d0f19]">
        {project.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.cover_image}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-violet-950/40 via-slate-900 to-indigo-950/40">
            <Code2 className="w-10 h-10 text-violet-400/60 mb-2" />
            <span className="text-xs text-slate-400 font-mono">Interactive Code Sandbox</span>
          </div>
        )}

        {/* Live Playground badge overlay */}
        {project.code_snippet && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#08090e]/80 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-[11px] font-medium shadow-md">
            <Play className="w-2.5 h-2.5 fill-cyan-400 text-cyan-400" />
            <span>Live Sandbox</span>
          </div>
        )}

        {/* Quick view indicator on hover */}
        <div className="absolute inset-0 bg-violet-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-xl">
            Inspect & Run →
          </span>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Author info */}
          <div className="flex items-center justify-between mb-3">
            <Link
              href={`/creators/${project.author_username}`}
              className="flex items-center gap-2.5 group/author"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.author_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${project.author_username}`}
                alt={project.author_name}
                className="w-6 h-6 rounded-full object-cover border border-white/10"
              />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-300 group-hover/author:text-white transition-colors">
                  {project.author_name}
                </span>
                <span className="text-[10px] text-slate-500 -mt-0.5">{project.author_role}</span>
              </div>
            </Link>

            {/* Star Button */}
            <button
              onClick={handleStar}
              disabled={isPending}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                hasStarred
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-sm shadow-amber-500/10"
                  : "bg-white/[0.04] text-slate-400 border-white/[0.06] hover:bg-white/[0.08] hover:text-slate-200"
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  hasStarred ? "fill-amber-400 text-amber-400" : "text-slate-400"
                }`}
              />
              <span>{starsCount}</span>
            </button>
          </div>

          {/* Title & Tagline */}
          <Link href={`/projects/${project.id}`} className="block group/title">
            <h3 className="text-base font-bold text-white group-hover/title:text-violet-300 transition-colors line-clamp-1">
              {project.title}
            </h3>
            <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {project.tagline}
            </p>
          </Link>
        </div>

        {/* Footer: Tags & Metrics */}
        <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 overflow-hidden">
            {tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/[0.06] text-[10px] font-medium"
              >
                #{t}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="text-[10px] text-slate-500">+{tags.length - 2}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px]" title="Views">
              <Eye className="w-3 h-3 text-slate-500" />
              {project.views}
            </span>
            <span className="flex items-center gap-1 text-[11px]" title="Comments">
              <MessageSquare className="w-3 h-3 text-slate-500" />
              {project.comments_count}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
