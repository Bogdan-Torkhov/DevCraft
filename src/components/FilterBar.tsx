"use client";

import { Flame, Clock, Star, Eye, Search, X } from "lucide-react";

const TAGS = [
  "All",
  "React",
  "Tailwind",
  "Canvas",
  "CreativeCoding",
  "WebGL",
  "Components",
  "CSSArt",
  "Microinteractions",
  "NextJS",
];

const SORT_OPTIONS = [
  { id: "trending", label: "Trending", icon: Flame },
  { id: "recent", label: "Recent", icon: Clock },
  { id: "stars", label: "Most Starred", icon: Star },
  { id: "views", label: "Views", icon: Eye },
] as const;

interface FilterBarProps {
  currentSort: string;
  currentTag: string;
  searchQuery: string;
  onSortChange: (sort: "trending" | "recent" | "stars" | "views") => void;
  onTagChange: (tag: string) => void;
  onSearchChange: (search: string) => void;
}

export default function FilterBar({
  currentSort,
  currentTag,
  searchQuery,
  onSortChange,
  onTagChange,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="mb-8 space-y-4 rounded-2xl border border-white/[0.07] bg-[#0a0c15]/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl sm:p-4">
      {/* Search & Sort Row */}
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            aria-label="Search projects by title, stack, or idea"
            placeholder="Search projects by title, stack, or idea..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.035] py-2.5 pl-10 pr-9 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-violet-400/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-violet-500/10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search query"
              className="absolute right-3 top-1/2 flex min-h-[24px] min-w-[24px] -translate-y-1/2 items-center justify-center rounded-md p-1 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort Tabs */}
        <div
          role="group"
          aria-label="Sort projects"
          className="scrollbar-none flex max-w-full items-center gap-0.5 self-start overflow-x-auto rounded-xl border border-white/[0.06] bg-black/20 p-1 sm:self-auto"
        >
          {SORT_OPTIONS.map(({ id, label, icon: Icon }) => {
            const isActive = currentSort === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSortChange(id)}
                aria-pressed={isActive}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-[0_4px_20px_-6px_rgba(139,92,246,0.85)]"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tech Tags horizontal scroll strip */}
      <div className="flex items-center gap-2.5">
        <span className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:inline">
          Stacks
        </span>
        <div
          role="group"
          aria-label="Filter projects by technology"
          className="scrollbar-none flex items-center gap-2 overflow-x-auto pb-0.5 text-xs"
        >
          {TAGS.map((tag) => {
            const isActive = currentTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onTagChange(tag)}
                aria-pressed={isActive}
                className={`whitespace-nowrap rounded-lg border px-3 py-1.5 transition-all ${
                  isActive
                    ? "border-violet-400/40 bg-gradient-to-r from-violet-500/25 to-cyan-500/15 font-semibold text-violet-200 shadow-[0_0_22px_-8px_rgba(139,92,246,0.9)]"
                    : "border-white/[0.06] bg-white/[0.03] text-slate-400 hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-slate-200"
                }`}
              >
                {tag === "All" ? "✦ All Stacks" : `#${tag}`}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
