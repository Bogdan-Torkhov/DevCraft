"use client";

import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import FilterBar from "./FilterBar";
import ProjectCard from "./ProjectCard";
import AuthModal from "./AuthModal";
import { ProjectWithAuthor } from "@/lib/db";
import { Sparkles } from "lucide-react";

interface ProjectFeedProps {
  initialProjects: ProjectWithAuthor[];
  initialTag: string;
}

export default function ProjectFeed({
  initialProjects,
  initialTag,
}: ProjectFeedProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [sort, setSort] = useState<"trending" | "recent" | "stars" | "views">("trending");
  const [tag, setTag] = useState<string>(initialTag);
  const [previousInitialTag, setPreviousInitialTag] = useState(initialTag);
  const [search, setSearch] = useState<string>("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Keep the active tag in sync when the URL changes through navigation or
  // browser back/forward. This is React's recommended way to adjust state when
  // a prop changes, and avoids an extra render pass from an effect.
  if (initialTag !== previousInitialTag) {
    setPreviousInitialTag(initialTag);
    setTag(initialTag);
  }

  const handleTagChange = (nextTag: string) => {
    setTag(nextTag);

    const params = new URLSearchParams(window.location.search);
    if (nextTag === "All") {
      params.delete("tag");
    } else {
      params.set("tag", nextTag);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const clearFilters = () => {
    setSearch("");
    setSort("trending");
    handleTagChange("All");
  };

  // Client-side filtering & sorting for instantaneous responsiveness
  const filteredProjects = useMemo(() => {
    let result = [...initialProjects];

    // Filter by tag
    if (tag && tag !== "All") {
      result = result.filter((p) => {
        try {
          const tagsArray: string[] = JSON.parse(p.tags);
          return tagsArray.some((t) => t.toLowerCase() === tag.toLowerCase());
        } catch {
          return p.tags.toLowerCase().includes(tag.toLowerCase());
        }
      });
    }

    // Filter by search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.author_name.toLowerCase().includes(q) ||
          p.tags.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sort) {
        case "recent":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "stars":
          return b.stars_count - a.stars_count;
        case "views":
          return b.views - a.views;
        case "trending":
        default:
          return b.stars_count * 3 + b.views - (a.stars_count * 3 + a.views);
      }
    });

    return result;
  }, [initialProjects, sort, tag, search]);

  return (
    <section id="showcases" aria-label="Community Showcases" className="scroll-mt-28">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-300/80">
            <span className="h-px w-6 bg-gradient-to-r from-violet-400/80 to-transparent" />
            Community feed
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Discover what creators are building
          </h2>
        </div>
        <div
          role="status"
          aria-live="polite"
          className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 font-mono text-[11px] text-slate-400 backdrop-blur-md"
        >
          <span className="text-slate-100">{filteredProjects.length}</span> of{" "}
          {initialProjects.length} projects
        </div>
      </div>

      <FilterBar
        currentSort={sort}
        currentTag={tag}
        searchQuery={search}
        onSortChange={setSort}
        onTagChange={handleTagChange}
        onSearchChange={setSearch}
      />

      {filteredProjects.length === 0 ? (
        <div className="glass-panel rounded-3xl px-6 py-20 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/15 to-cyan-500/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <Sparkles className="h-6 w-6 text-violet-300" />
          </div>
          <h3 className="text-base font-bold text-white">No projects found</h3>
          <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-slate-400">
            Try adjusting your search query or stack filters to find what you&apos;re looking for.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-slate-200 transition-all hover:border-violet-400/40 hover:bg-white/[0.08] hover:text-white"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onRequireAuth={() => setIsAuthModalOpen(true)}
              onTagClick={handleTagChange}
            />
          ))}
        </div>
      )}

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </section>
  );
}
