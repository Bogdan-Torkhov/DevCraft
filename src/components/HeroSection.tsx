"use client";

import { Sparkles, Terminal, Layers, Heart, Cpu } from "lucide-react";

interface HeroSectionProps {
  stats: {
    totalProjects: number;
    totalStars: number;
    totalCreators: number;
  };
  onOpenPublish?: () => void;
}

export default function HeroSection({ stats }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-10 border-b border-white/[0.06]">
      {/* Background ambient neon glow spheres */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-violet-600/15 via-indigo-600/15 to-cyan-500/10 blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Top Tag Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold tracking-wide mb-6">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Interactive Playground & Community Showcase</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Where Creative Code{" "}
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            Meets UI Craft.
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Discover, inspect, and run cutting-edge web components, generative canvas art, and UI/UX prototypes right in your browser.
        </p>

        {/* Stats Strip */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-400">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-white">{stats.totalProjects} Showcase Projects</div>
              <div className="text-[11px] text-slate-500">Live Sandboxes</div>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-white/[0.08] hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-white">{stats.totalCreators} Active Creators</div>
              <div className="text-[11px] text-slate-500">Designers & Devs</div>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-white/[0.08] hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <Heart className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-white">{stats.totalStars} Community Stars</div>
              <div className="text-[11px] text-slate-500">Peer Endorsements</div>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-white/[0.08] hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-white">Next.js 15 + React 19</div>
              <div className="text-[11px] text-slate-500">Native SQLite Engine</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
