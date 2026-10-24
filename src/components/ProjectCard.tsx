"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, MessageSquare, Eye, Play, Code2, ArrowUpRight } from "lucide-react";
import { ProjectWithAuthor } from "@/lib/db";
import { toggleStarAction } from "@/app/actions";
import { useToast } from "./Toast";

interface ProjectCardProps {
  project: ProjectWithAuthor;
  onRequireAuth?: () => void;
  onTagClick?: (tag: string) => void;
}

export default function ProjectCard({ project, onRequireAuth, onTagClick }: ProjectCardProps) {
  const router = useRouter();
  const [hasStarred, setHasStarred] = useState(project.has_starred ?? false);
  const [starsCount, setStarsCount] = useState(project.stars_count);
  const [isPending, startTransition] = useTransition();
  const [isStarPopping, setIsStarPopping] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number; opacity: number }>({
    x: 0,
    y: 0,
    opacity: 0,
  });
  const { toast } = useToast();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setMousePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleStar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextStarred = !hasStarred;
    setHasStarred(nextStarred);
    setStarsCount((prev) => (nextStarred ? prev + 1 : Math.max(0, prev - 1)));
    setIsStarPopping(true);
    setTimeout(() => setIsStarPopping(false), 400);

    if (nextStarred) {
      toast({
        title: `Starred ${project.title}`,
        message: "Added to your endorsed community showcases! ⭐",
        type: "success",
      });
    }

    startTransition(async () => {
      const res = await toggleStarAction(project.id);
      if ("error" in res && res.error) {
        setHasStarred(!nextStarred);
        setStarsCount(project.stars_count);
        toast({
          title: "Sign In Required",
          message: "Please sign in or create an account to star projects.",
          type: "error",
        });
        if (onRequireAuth) onRequireAuth();
      } else if ("totalStars" in res && res.totalStars !== undefined) {
        setStarsCount(res.totalStars);
      }
    });
  };

  const handleTagClick = (e: React.MouseEvent, t: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (onTagClick) {
      onTagClick(t);
    } else {
      router.push(`/?tag=${encodeURIComponent(t)}`);
    }
  };

  let tags: string[] = [];
  try {
    tags = JSON.parse(project.tags);
  } catch {
    tags = project.tags ? project.tags.split(",") : [];
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="glass-card rounded-2xl overflow-hidden flex flex-col group relative"
    >
      {/* Interactive cursor spotlight inside card */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300 -z-0"
        style={{
          opacity: mousePos.opacity,
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(139, 92, 246, 0.12), transparent 70%)`,
        }}
      />

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
            <Code2 className="w-10 h-10 text-violet-400/60 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-slate-400 font-mono">Interactive Code Sandbox</span>
          </div>
        )}

        {/* Live Playground badge overlay with pulse dot */}
        {project.code_snippet && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#08090e]/85 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-[11px] font-medium shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <Play className="w-2.5 h-2.5 fill-cyan-400 text-cyan-400" />
            <span>Live Sandbox</span>
          </div>
        )}

        {/* Quick view indicator on hover */}
        <div className="absolute inset-0 bg-violet-950/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
          <span className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-xl flex items-center gap-1.5 group-hover:scale-105 transition-transform">
            <span>Inspect & Run</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
          </span>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between relative z-10">
        <div>
          {/* Author info: Clicking avatar, name, or @username navigates to creator profile! */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 group/author">
              <Link
                href={`/creators/${project.author_username}`}
                className="shrink-0 hover:scale-105 transition-transform"
                title={`Visit @${project.author_username}'s profile`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.author_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${project.author_username}`}
                  alt={project.author_name}
                  className="w-7 h-7 rounded-full object-cover border border-white/10 group-hover/author:border-violet-400 transition-colors"
                />
              </Link>
              <div className="flex flex-col">
                <Link
                  href={`/creators/${project.author_username}`}
                  className="text-xs font-semibold text-slate-200 hover:text-violet-300 transition-colors"
                >
                  {project.author_name}
                </Link>
                <Link
                  href={`/creators/${project.author_username}`}
                  className="text-[11px] text-violet-400/90 hover:text-violet-300 font-mono -mt-0.5"
                >
                  @{project.author_username}
                </Link>
              </div>
            </div>

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
                className={`w-3.5 h-3.5 transition-transform ${
                  isStarPopping ? "animate-star-pop fill-amber-400 text-amber-400" : hasStarred ? "fill-amber-400 text-amber-400" : "text-slate-400"
                }`}
              />
              <span className="font-mono">{starsCount}</span>
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

        {/* Footer: Fully working Tags & Metrics */}
        <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-500">
          {/* Clickable Tag Buttons */}
          <div className="flex items-center gap-1.5 overflow-hidden">
            {tags.slice(0, 2).map((t) => (
              <button
                key={t}
                onClick={(e) => handleTagClick(e, t)}
                className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-violet-500/20 hover:text-violet-300 hover:border-violet-500/40 text-slate-400 border border-white/[0.06] text-[10px] font-medium transition-all cursor-pointer"
                title={`Filter by #${t}`}
              >
                #{t}
              </button>
            ))}
            {tags.length > 2 && (
              <button
                onClick={(e) => handleTagClick(e, tags[2])}
                className="text-[10px] text-slate-500 hover:text-violet-300"
              >
                +{tags.length - 2}
              </button>
            )}
          </div>

          {/* Metrics: Clickable Comments and Views */}
          <div className="flex items-center gap-3 font-mono">
            <span
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
              title={`${project.views} views recorded`}
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>{project.views}</span>
            </span>

            <Link
              href={`/projects/${project.id}#comments`}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-violet-300 transition-colors cursor-pointer group/cmt"
              title="Jump to community comments"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-500 group-hover/cmt:text-violet-400" />
              <span>{project.comments_count}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
