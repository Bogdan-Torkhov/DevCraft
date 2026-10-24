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
    <div className="space-y-4 mb-8">
      {/* Search & Sort Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects by title, stack, or idea..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-violet-500/50 focus:bg-white/[0.06] text-sm text-white placeholder-slate-500 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              aria-label="Clear search query"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 min-w-[24px] min-h-[24px] flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-white/[0.03] border border-white/[0.08] self-start sm:self-auto">
          <button
            onClick={() => onSortChange("trending")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentSort === "trending"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Trending</span>
          </button>

          <button
            onClick={() => onSortChange("recent")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentSort === "recent"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Recent</span>
          </button>

          <button
            onClick={() => onSortChange("stars")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentSort === "stars"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Most Starred</span>
          </button>

          <button
            onClick={() => onSortChange("views")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentSort === "views"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Views</span>
          </button>
        </div>

      </div>

      {/* Tech Tags horizontal scroll strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        {TAGS.map((tag) => {
          const isActive = currentTag === tag;
          return (
            <button
              key={tag}
              onClick={() => onTagChange(tag)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-violet-500/20 text-violet-300 border-violet-500/40 font-semibold shadow-sm shadow-violet-500/20"
                  : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.07] hover:text-slate-200"
              }`}
            >
              {tag === "All" ? "✦ All Stacks" : `#${tag}`}
            </button>
          );
        })}
      </div>
    </div>
  );
}
