import {
  Sparkles,
  Terminal,
  Layers,
  Heart,
  Cpu,
  ArrowDown,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface HeroSectionProps {
  stats: {
    totalProjects: number;
    totalStars: number;
    totalCreators: number;
  };
}

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  shortLabel?: string;
  accent: string;
  glow: string;
}

function StatCard({ icon: Icon, value, label, shortLabel, accent, glow }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:bg-white/[0.045]">
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl opacity-70 transition-opacity duration-300 group-hover:opacity-100 ${glow}`}
      />
      <div className="relative flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${accent}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="font-mono text-xl font-extrabold tracking-tight text-white">
            {value}
          </div>
          <div className="text-[9px] font-medium uppercase leading-tight tracking-[0.08em] text-slate-400 sm:text-[10px] sm:tracking-[0.14em]">
            <span className="sm:hidden">{shortLabel ?? label}</span>
            <span className="hidden sm:inline">{label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection({ stats }: HeroSectionProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/[0.06] pt-14 pb-14 sm:pt-20 sm:pb-20">
      {/* Ambient background layers */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-60" />
      <div className="pointer-events-none absolute left-1/2 top-[-18rem] h-[34rem] w-[54rem] -translate-x-1/2">
        <div className="animate-aurora h-full w-full rounded-full bg-violet-600/20 blur-[130px]" />
      </div>
      <div className="animate-float pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-cyan-500/10 blur-[110px]" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[110px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <div className="animate-rise inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-cyan-500/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md sm:text-[11px]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-300" />
          </span>
          <Sparkles className="h-3.5 w-3.5 text-violet-300" />
          <span className="hidden sm:inline">Next-gen interactive component hub</span>
          <span className="sm:hidden">Interactive component hub</span>
        </div>

        {/* Headline */}
        <h1 className="animate-rise animate-delay-1 mx-auto mt-7 max-w-4xl text-balance text-4xl font-black leading-[1.05] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl">
          Where creative code{" "}
          <span className="text-gradient animate-gradient">meets UI craft.</span>
        </h1>

        {/* Subhead */}
        <p className="animate-rise animate-delay-2 mx-auto mt-6 max-w-2xl text-pretty text-sm leading-relaxed text-slate-300/80 sm:text-base">
          Discover, inspect, and run cutting-edge web components, generative
          canvas art, and UI/UX prototypes right in your browser.
        </p>

        {/* Primary actions */}
        <div className="animate-rise animate-delay-3 mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <a
            href="#showcases"
            className="group inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-white px-4 py-2.5 text-[11px] font-bold text-[#0b0c14] shadow-[0_10px_40px_-12px_rgba(255,255,255,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_50px_-12px_rgba(255,255,255,0.5)] sm:px-5 sm:text-xs"
          >
            Explore showcases
            <ArrowDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
          </a>
          <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-[10px] font-medium text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md sm:px-4 sm:text-[11px]">
            <Zap className="h-3.5 w-3.5 text-cyan-300" />
            Runs 100% locally
          </span>
        </div>

        {/* Feature chips */}
        <div className="animate-rise animate-delay-3 mt-9 flex flex-wrap items-center justify-center gap-2.5">
          {[
            { label: "Live sandboxed iframes", dot: "bg-emerald-400", glow: "shadow-[0_0_8px_rgba(52,211,153,0.9)]" },
            { label: "Zero-config local SQLite", dot: "bg-cyan-400", glow: "shadow-[0_0_8px_rgba(34,211,238,0.9)]" },
            { label: "React 19 server actions", dot: "bg-violet-400", glow: "shadow-[0_0_8px_rgba(139,92,246,0.9)]" },
          ].map((feature) => (
            <span
              key={feature.label}
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 font-mono text-[10px] text-slate-300 backdrop-blur-md sm:text-[11px]"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${feature.dot} ${feature.glow}`} />
              {feature.label}
            </span>
          ))}
        </div>

        {/* Stats strip */}
        <div className="animate-rise animate-delay-4 mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          <StatCard
            icon={Layers}
            value={stats.totalProjects}
            label="Showcases"
            accent="bg-violet-500/10 text-violet-300 ring-violet-400/20"
            glow="bg-violet-500/25"
          />
          <StatCard
            icon={Cpu}
            value={stats.totalCreators}
            label="Creators"
            accent="bg-cyan-500/10 text-cyan-300 ring-cyan-400/20"
            glow="bg-cyan-500/25"
          />
          <StatCard
            icon={Heart}
            value={stats.totalStars}
            label="Stars earned"
            shortLabel="Stars"
            accent="bg-amber-500/10 text-amber-300 ring-amber-400/20"
            glow="bg-amber-500/25"
          />
          <StatCard
            icon={Terminal}
            value="100%"
            label="Interactive"
            accent="bg-emerald-500/10 text-emerald-300 ring-emerald-400/20"
            glow="bg-emerald-500/25"
          />
        </div>
      </div>
    </section>
  );
}
