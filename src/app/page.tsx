import { getCurrentUser } from "@/lib/auth";
import { getAllUsers, getProjects, getStats } from "@/lib/services";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProjectFeed from "@/components/ProjectFeed";

export default async function HomePage() {
  const [currentUser, demoUsers, stats] = await Promise.all([
    getCurrentUser(),
    getAllUsers(),
    getStats(),
  ]);

  const projects = getProjects({
    currentUserId: currentUser?.id,
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#08090e]">
      <Navbar currentUser={currentUser} demoUsers={demoUsers} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <HeroSection stats={stats} />
        
        <div className="mt-8">
          <ProjectFeed
            initialProjects={projects}
            demoUsers={demoUsers}
            currentUser={currentUser}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#07080d] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">DevCraft</span>
            <span>• The Developer & UI/UX Showcase Engine</span>
          </div>
          <div>
            Built with Next.js 15, React 19, Tailwind CSS & SQLite
          </div>
        </div>
      </footer>
    </div>
  );
}
