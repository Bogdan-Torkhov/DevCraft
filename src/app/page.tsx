import { Code2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getProjects, getStats } from "@/lib/services";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProjectFeed from "@/components/ProjectFeed";

interface HomePageProps {
  searchParams: Promise<{ tag?: string | string[] }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const [currentUser, stats, params] = await Promise.all([
    getCurrentUser(),
    getStats(),
    searchParams,
  ]);

  const requestedTag = Array.isArray(params.tag) ? params.tag[0] : params.tag;
  const initialTag = requestedTag?.trim() || "All";

  const projects = getProjects({
    currentUserId: currentUser?.id,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar currentUser={currentUser} />
      
      <HeroSection stats={stats} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-10">
        <ProjectFeed
          initialProjects={projects}
          initialTag={initialTag}
        />
      </main>

      {/* Footer */}
      <footer className="relative mt-4 border-t border-white/[0.06] py-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/35 to-transparent" />
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <Code2 className="h-4 w-4 text-violet-300" />
            </div>
            <div>
              <div className="font-semibold tracking-tight text-slate-200">DevCraft</div>
              <div className="text-[10px] text-slate-500">The developer &amp; UI/UX showcase engine</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              All systems local
            </span>
            <span className="text-slate-500">
              Built with Next.js 16 · React 19 · Tailwind CSS
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
