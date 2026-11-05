import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Globe, Eye, Sparkles } from "lucide-react";
import { GithubIcon } from "@/components/Icons";
import { getCurrentUser } from "@/lib/auth";
import { getProjectById, incrementViews, getComments } from "@/lib/services";
import Navbar from "@/components/Navbar";
import CodeSandboxViewer from "@/components/CodeSandboxViewer";
import CommentSection from "@/components/CommentSection";
import Avatar from "@/components/Avatar";
import DetailActionButtons from "./DetailActionButtons";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
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

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  incrementViews(id);
  const project = getProjectById(id, currentUser?.id);

  if (!project) {
    notFound();
  }

  const comments = getComments(id);

  let tags: string[] = [];
  try {
    tags = JSON.parse(project.tags);
  } catch {
    tags = project.tags ? project.tags.split(",") : [];
  }

  const isAuthor = currentUser?.id === project.author_id;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar currentUser={currentUser} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Back Link & Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Showcases</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-1 font-mono text-[11px] text-slate-400 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
              <Eye className="h-3.5 w-3.5 text-cyan-300/80" />
              <span className="tabular-nums">{project.views} views</span>
            </span>
          </div>
        </div>

        {/* Project Header */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#121527]/95 via-[#0c0e17]/95 to-[#0a0b12] p-5 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.95)] sm:p-8">
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-violet-600/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              {/* Clickable Tech Stack Tags */}
              <div className="flex flex-wrap items-center gap-2">
                {tags.map((t) => (
                  <Link
                    key={t}
                    href={`/?tag=${encodeURIComponent(t)}`}
                    className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-300 transition-all hover:border-violet-400/40 hover:bg-violet-500/20 hover:text-violet-100"
                  >
                    #{t}
                  </Link>
                ))}
              </div>

              <h1 className="bg-gradient-to-br from-white via-white to-slate-400 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl lg:text-5xl">
                {project.title}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
                {project.tagline}
              </p>
            </div>

            {/* Interactive Star & Action Buttons */}
            <DetailActionButtons
              project={project}
              isAuthor={isAuthor}
              currentUser={currentUser}
            />
          </div>
        </div>

        {/* Live Code Sandbox or Mockup Showcase */}
        {project.code_snippet ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300/80">
              <Sparkles className="w-3.5 h-3.5 text-violet-300" />
              <span>Executable Component & Live Sandbox</span>
            </div>
            <CodeSandboxViewer codeSnippet={project.code_snippet} title={project.title} />
          </div>
        ) : project.cover_image ? (
          <div className="flex max-h-[600px] items-center justify-center overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c0e17] shadow-[0_30px_80px_-50px_rgba(0,0,0,0.95)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.cover_image}
              alt={project.title}
              className="w-full h-full object-cover max-h-[600px]"
            />
          </div>
        ) : null}

        {/* Grid: Case Study Description & Author Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Case Study */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel space-y-5 rounded-3xl p-6 sm:p-7">
              <div>
                <div className="eyebrow">Case study</div>
                <h2 className="mt-1.5 text-lg font-bold tracking-tight text-white">Project Case Study &amp; Technical Notes</h2>
              </div>
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                {project.description}
              </div>

              {/* External Links */}
              <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-4">
                {isSafeUrl(project.demo_url) && (
                  <a
                    href={project.demo_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/30 text-xs font-semibold text-violet-300 hover:text-white transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Launch Live URL</span>
                  </a>
                )}

                {isSafeUrl(project.github_url) && (
                  <a
                    href={project.github_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                  >
                    <GithubIcon className="w-4 h-4" />
                    <span>View Source on GitHub</span>
                  </a>
                )}
              </div>
            </div>

            {/* Peer Comments (with #comments anchor target!) */}
            <div id="comments">
              <CommentSection
                projectId={project.id}
                initialComments={comments}
                currentUser={currentUser}
              />
            </div>
          </div>

          {/* Author Sidebar: Fully modern, clicking avatar, name, or @username directly navigates to their profile! */}
          <div className="space-y-6">
            <div className="glass-panel sticky top-24 space-y-4 rounded-3xl p-6 transition-colors duration-300 hover:border-violet-400/30">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300/80">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.9)]" />
                Author &amp; Creator
              </div>

              <Link
                href={`/creators/${project.author_username}`}
                className="group/author flex min-h-[48px] items-center gap-3.5 py-1"
                title={`View @${project.author_username}'s profile`}
              >
                <span className="shrink-0 rounded-2xl bg-gradient-to-br from-violet-400 via-fuchsia-400 to-cyan-300 p-[1px] transition-transform duration-300 group-hover/author:scale-105">
                  <Avatar
                    src={project.author_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${project.author_username}`}
                    name={project.author_name}
                    className="h-12 w-12 rounded-2xl border border-[#0b0d17] object-cover"
                    textClassName="text-sm"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-base font-bold text-white group-hover/author:text-violet-300 transition-colors block truncate">
                    {project.author_name}
                  </span>
                  <span className="text-xs text-violet-400 group-hover/author:text-violet-300 font-mono block truncate">
                    @{project.author_username}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{project.author_role}</p>
                </div>
              </Link>

              <p className="text-xs text-slate-400 leading-relaxed pt-1 border-t border-white/[0.06]">
                Contributing innovative components, open design systems, and code experiments to DevCraft.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
