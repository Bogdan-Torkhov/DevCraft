"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, MessageSquare, Eye, Play, Code2, ArrowUpRight } from "lucide-react";
import { ProjectWithAuthor } from "@/lib/db";
import { toggleStarAction } from "@/app/actions";
import { useToast } from "./Toast";
import Avatar from "./Avatar";

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
  const [coverFailed, setCoverFailed] = useState(false);
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

    const previousStarred = hasStarred;
    const previousStarsCount = starsCount;
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
        setHasStarred(previousStarred);
        setStarsCount(previousStarsCount);
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
      className="glass-card group relative flex flex-col overflow-hidden rounded-3xl"
    >
      {/* Interactive cursor spotlight inside card */}
      <div
        className="pointer-events-none absolute -inset-px z-0 rounded-3xl transition-opacity duration-300"
        style={{
          opacity: mousePos.opacity,
          background: `radial-gradient(420px circle at ${mousePos.x}px ${mousePos.y}px, rgba(139, 92, 246, 0.16), transparent 65%)`,
        }}
      />

      {/* Visual Cover / Preview Thumbnail */}
      <Link
        href={`/projects/${project.id}`}
        className="relative block h-52 w-full overflow-hidden bg-[#0a0c15]"
      >
        {project.cover_image && !coverFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.cover_image}
            alt={project.title}
            onError={() => setCoverFailed(true)}
            className="h-full w-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.06] group-hover:opacity-100"
          />
        ) : (
          <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-violet-950/50 via-[#0b0d17] to-cyan-950/30 p-6 text-center">
            <div className="absolute inset-0 bg-grid-pattern opacity-40" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <Code2 className="h-6 w-6 text-violet-300 transition-transform duration-500 group-hover:scale-110" />
            </div>
            <span className="relative mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
              {coverFailed ? "Preview unavailable" : "Interactive code sandbox"}
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0c14] via-transparent to-transparent opacity-90" />

        {/* Live Playground badge overlay with pulse dot */}
        {project.code_snippet && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-[#070a12]/80 px-2.5 py-1 text-[10px] font-semibold text-cyan-300 shadow-[0_4px_20px_-6px_rgba(34,211,238,0.6)] backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-300" />
            </span>
            <Play className="h-2.5 w-2.5 fill-cyan-300 text-cyan-300" />
            <span>Live Sandbox</span>
          </div>
        )}

        {/* Quick view indicator on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-[#070912]/45 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold text-white shadow-2xl backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
            Inspect &amp; run
            <ArrowUpRight className="h-3.5 w-3.5 text-cyan-300" />
          </span>
        </div>
      </Link>

      {/* Card Content */}
      <div className="relative z-10 flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Author info: single unified accessible touch target */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <Link
              href={`/creators/${project.author_username}`}
              className="group/author flex min-h-[36px] items-center gap-2.5 py-0.5"
              title={`Visit @${project.author_username}'s profile`}
            >
              <span className="rounded-full bg-gradient-to-br from-violet-400 via-fuchsia-400 to-cyan-300 p-[1px]">
                <Avatar
                  src={
                    project.author_avatar ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${project.author_username}`
                  }
                  name={project.author_name}
                  className="h-7 w-7 rounded-full border border-[#0b0d17] object-cover"
                  textClassName="text-[9px]"
                />
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-200 transition-colors group-hover/author:text-violet-200">
                  {project.author_name}
                </span>
                <span className="-mt-0.5 font-mono text-[10px] text-violet-300/80 transition-colors group-hover/author:text-violet-200">
                  @{project.author_username}
                </span>
              </div>
            </Link>

            {/* Star Button */}
            <button
              type="button"
              onClick={handleStar}
              disabled={isPending}
              aria-label={
                hasStarred
                  ? `Unstar project, current stars: ${starsCount}`
                  : `Star project, current stars: ${starsCount}`
              }
              className={`flex min-h-[32px] items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
                hasStarred
                  ? "border-amber-400/30 bg-amber-400/10 text-amber-300 shadow-[0_0_20px_-8px_rgba(251,191,36,0.8)]"
                  : "border-white/[0.07] bg-white/[0.04] text-slate-300 hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-slate-100"
              }`}
            >
              <Star
                className={`h-3.5 w-3.5 transition-transform ${
                  isStarPopping
                    ? "animate-star-pop fill-amber-400 text-amber-400"
                    : hasStarred
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-400"
                }`}
              />
              <span className="font-mono tabular-nums">{starsCount}</span>
            </button>
          </div>

          {/* Title & Tagline */}
          <Link href={`/projects/${project.id}`} className="group/title block">
            <h3 className="line-clamp-1 text-[17px] font-semibold tracking-tight text-white transition-colors group-hover/title:text-violet-200">
              {project.title}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-400">
              {project.tagline}
            </p>
          </Link>
        </div>

        {/* Footer: working Tags & Metrics */}
        <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3.5 text-xs text-slate-300">
          {/* Clickable Tag Buttons */}
          <div className="flex items-center gap-1.5 overflow-hidden">
            {tags.slice(0, 2).map((t) => (
              <button
                key={t}
                type="button"
                onClick={(e) => handleTagClick(e, t)}
                className="min-h-[26px] rounded-md border border-white/[0.06] bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-slate-300 transition-all hover:border-violet-400/40 hover:bg-violet-500/15 hover:text-violet-200"
                title={`Filter by #${t}`}
                aria-label={`Filter by #${t}`}
              >
                #{t}
              </button>
            ))}
            {tags.length > 2 && (
              <button
                type="button"
                onClick={(e) => handleTagClick(e, tags[2])}
                className="min-h-[26px] min-w-[26px] rounded-md border border-white/[0.06] bg-white/[0.04] px-1.5 py-1 text-[10px] font-semibold text-slate-300 transition-all hover:border-violet-400/40 hover:bg-violet-500/15 hover:text-violet-200"
                title={`Filter by #${tags[2]}`}
                aria-label={`Filter by #${tags[2]} (${tags.length - 2} more tags available)`}
              >
                +{tags.length - 2}
              </button>
            )}
          </div>

          {/* Metrics: Clickable Comments and Views */}
          <div className="flex items-center gap-3 font-mono">
            <span
              className="flex items-center gap-1 text-[11px] text-slate-400"
              title={`${project.views} views recorded`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="tabular-nums">{project.views}</span>
            </span>

            <Link
              href={`/projects/${project.id}#comments`}
              className="group/cmt flex min-h-[26px] items-center gap-1 text-[11px] text-slate-400 transition-colors hover:text-violet-300"
              title="Jump to community comments"
              aria-label={`View ${project.comments_count} comments`}
            >
              <MessageSquare className="h-3.5 w-3.5 transition-colors group-hover/cmt:text-violet-300" />
              <span className="tabular-nums">{project.comments_count}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
