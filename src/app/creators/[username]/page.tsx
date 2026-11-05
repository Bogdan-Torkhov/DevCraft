import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getUserByUsername, getProjects } from "@/lib/services";
import Navbar from "@/components/Navbar";
import ProjectCard from "@/components/ProjectCard";
import CreatorHeader from "./CreatorHeader";

interface CreatorPageProps {
  params: Promise<{ username: string }>;
}

export default async function CreatorProfilePage({ params }: CreatorPageProps) {
  const { username } = await params;
  const currentUser = await getCurrentUser();

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
  const isOwner = currentUser?.id === user.id;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar currentUser={currentUser} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
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

        {/* Creator Hero Header with About Me & Edit Profile */}
        <CreatorHeader
          user={user}
          isOwner={isOwner}
          projectsCount={projects.length}
          totalStarsReceived={totalStarsReceived}
          totalViews={totalViews}
        />

        {/* Creations Grid */}
        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-300/80">
                <span className="h-px w-6 bg-gradient-to-r from-violet-400/80 to-transparent" />
                Portfolio
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Showcase Portfolio</h2>
            </div>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 font-mono text-[11px] text-slate-400 backdrop-blur-md">
              <span className="text-slate-100">{projects.length}</span>{" "}
              {projects.length === 1 ? "creation" : "creations"}
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="glass-panel rounded-3xl py-16 text-center">
              <p className="text-xs text-slate-400">No creations published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
