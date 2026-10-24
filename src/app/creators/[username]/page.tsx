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
    <div className="min-h-screen flex flex-col bg-[#08090e]">
      <Navbar currentUser={currentUser} />

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

        {/* Creator Hero Header with About Me & Edit Profile */}
        <CreatorHeader
          user={user}
          isOwner={isOwner}
          projectsCount={projects.length}
          totalStarsReceived={totalStarsReceived}
          totalViews={totalViews}
        />

        {/* Creations Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Showcase Portfolio</h2>
            <span className="text-xs text-slate-500 font-mono">{projects.length} creations</span>
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
