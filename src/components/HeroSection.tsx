"use client";

import { Sparkles, Terminal, Layers, Heart, Cpu, Code2, ArrowUpRight } from "lucide-react";

interface HeroSectionProps {
  stats: {
    totalProjects: number;
    totalStars: number;
    totalCreators: number;
  };
}

export default function HeroSection({ stats }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-14 pb-12 border-b border-white/[0.06]">
      {/* Background ambient neon glow spheres & animated grid */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-60" />
      
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-gradient-to-tr from-violet-600/20 via-indigo-600/20 to-purple-800/10 blur-[130px] pointer-events-none -z-10 animate-pulse-subtle" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[280px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/15 to-transparent blur-[120px] pointer-events-none -z-10 animate-float" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Shimmering Top Tag Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-xs font-semibold tracking-wide mb-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-shimmer pointer-events-none" />
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span className="bg-gradient-to-r from-violet-200 to-cyan-200 bg-clip-text text-transparent font-medium">
            Next-Gen Interactive Component Hub
          </span>
        </div>

        {/* Headline with glowing gradient text */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
          Where Creative Code{" "}
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent underline decoration-violet-500/30 decoration-wavy decoration-from-font">
            Meets UI Craft.
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Discover, inspect, and run cutting-edge web components, generative canvas art, and UI/UX prototypes right in your browser.
        </p>

        {/* Quick feature callouts with floating animations */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.07] text-[11px] font-mono text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Live Sandboxed Iframes
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.07] text-[11px] font-mono text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Zero-Config Local SQLite
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.07] text-[11px] font-mono text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            React 19 Server Actions
          </span>
        </div>

        {/* Stats Strip with Glassmorphism & Hover Glow */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          
          <div className="p-3.5 rounded-2xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/[0.06] hover:border-violet-500/30 transition-all duration-300 flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-base font-extrabold text-white font-mono">{stats.totalProjects}</div>
              <div className="text-[11px] text-slate-400">Showcases</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/[0.06] hover:border-cyan-500/30 transition-all duration-300 flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-base font-extrabold text-white font-mono">{stats.totalCreators}</div>
              <div className="text-[11px] text-slate-400">Creators</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/[0.06] hover:border-amber-500/30 transition-all duration-300 flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Heart className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-base font-extrabold text-white font-mono">{stats.totalStars}</div>
              <div className="text-[11px] text-slate-400">Stars Earned</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/[0.06] hover:border-emerald-500/30 transition-all duration-300 flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-base font-extrabold text-white font-mono">100%</div>
              <div className="text-[11px] text-slate-400">Interactive</div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
