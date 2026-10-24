import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Globe, Eye, Sparkles } from "lucide-react";
import { GithubIcon } from "@/components/Icons";
import { getCurrentUser } from "@/lib/auth";
import { getProjectById, incrementViews, getComments } from "@/lib/services";
import Navbar from "@/components/Navbar";
import CodeSandboxViewer from "@/components/CodeSandboxViewer";
import CommentSection from "@/components/CommentSection";
import DetailActionButtons from "./DetailActionButtons";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
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
    <div className="min-h-screen flex flex-col bg-[#08090e]">
      <Navbar currentUser={currentUser} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] text-xs text-slate-400 border border-white/[0.06] font-mono">
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>{project.views} views</span>
            </span>
          </div>
        </div>

        {/* Project Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="space-y-3 max-w-3xl">
            {/* Clickable Tech Stack Tags */}
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((t) => (
                <Link
                  key={t}
                  href={`/?tag=${encodeURIComponent(t)}`}
                  className="px-2.5 py-0.5 rounded-full bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 hover:text-violet-200 border border-violet-500/20 hover:border-violet-500/40 text-xs font-medium transition-all"
                >
                  #{t}
                </Link>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {project.title}
            </h1>
            <p className="text-base text-slate-400 leading-relaxed">
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

        {/* Live Code Sandbox or Mockup Showcase */}
        {project.code_snippet ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Executable Component & Live Sandbox</span>
            </div>
            <CodeSandboxViewer codeSnippet={project.code_snippet} title={project.title} />
          </div>
        ) : project.cover_image ? (
          <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0c0e17] max-h-[600px] flex items-center justify-center">
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
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-6 space-y-4">
              <h2 className="text-lg font-bold text-white">Project Case Study & Technical Notes</h2>
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                {project.description}
              </div>

              {/* External Links */}
              <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-4">
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/30 text-xs font-semibold text-violet-300 hover:text-white transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Launch Live URL</span>
                  </a>
                )}

                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noreferrer"
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
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-6 space-y-4 sticky top-24 hover:border-violet-500/30 transition-all duration-300">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Author & Creator
              </div>

              <div className="flex items-center gap-3.5">
                <Link
                  href={`/creators/${project.author_username}`}
                  className="shrink-0 hover:scale-105 transition-transform"
                  title={`View @${project.author_username}'s profile`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.author_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${project.author_username}`}
                    alt={project.author_name}
                    className="w-12 h-12 rounded-2xl object-cover border border-white/10 hover:border-violet-400 transition-colors"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/creators/${project.author_username}`}
                    className="text-base font-bold text-white hover:text-violet-300 transition-colors block truncate"
                  >
                    {project.author_name}
                  </Link>
                  <Link
                    href={`/creators/${project.author_username}`}
                    className="text-xs text-violet-400 hover:text-violet-300 font-mono block truncate"
                  >
                    @{project.author_username}
                  </Link>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{project.author_role}</p>
                </div>
              </div>

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
