import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Globe, Star, Layers, Eye, Calendar } from "lucide-react";
import { GithubIcon } from "@/components/Icons";
import { getCurrentUser } from "@/lib/auth";
import { getUserByUsername, getAllUsers, getProjects } from "@/lib/services";
import Navbar from "@/components/Navbar";
import ProjectCard from "@/components/ProjectCard";

interface CreatorPageProps {
  params: Promise<{ username: string }>;
}

export default async function CreatorProfilePage({ params }: CreatorPageProps) {
  const { username } = await params;
  const currentUser = await getCurrentUser();
  const demoUsers = getAllUsers();

  const user = getUserByUsername(username);
  if (!user) {
    notFound();
  }

  const projects = getProjects({
    authorId: user.id,
    currentUserId: currentUser?.id,
  });

  const totalStarsReceived = projects.reduce((acc, p) => acc + p.stars_count, 0);
  const totalViews = projects.reduce((acc, p) => acc + p.views, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#08090e]">
      <Navbar currentUser={currentUser} demoUsers={demoUsers} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Explorer</span>
          </Link>
        </div>

        {/* Creator Hero Header */}
        <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#111422] to-[#0c0e17] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                alt={user.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white/10 shadow-xl"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{user.name}</h1>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-violet-400 font-semibold">@{user.username}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 font-medium">{user.role}</span>
                </div>
                <p className="text-xs text-slate-400 max-w-xl pt-1 leading-relaxed">
                  {user.bio || "Creator on DevCraft."}
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
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
            </div>
          </div>

          {/* Metrics bar */}
          <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center gap-8 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              <span className="font-bold text-white text-sm">{projects.length}</span>
              <span>Published Creations</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white text-sm">{totalStarsReceived}</span>
              <span>Stars Earned</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white text-sm">{totalViews}</span>
              <span>Total Views</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar className="w-4 h-4" />
              <span>Joined DevCraft</span>
            </div>
          </div>
        </div>

        {/* Creations Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Showcase Portfolio</h2>
            <span className="text-xs text-slate-500">{projects.length} items</span>
          </div>

          {projects.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <p className="text-xs text-slate-400">No creations published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
