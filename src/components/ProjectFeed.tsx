"use client";

import { useState, useMemo } from "react";
import FilterBar from "./FilterBar";
import ProjectCard from "./ProjectCard";
import AuthModal from "./AuthModal";
import { ProjectWithAuthor, DbUser } from "@/lib/db";
import { Sparkles } from "lucide-react";

interface ProjectFeedProps {
  initialProjects: ProjectWithAuthor[];
  demoUsers: Omit<DbUser, "password_hash">[];
  currentUser: Omit<DbUser, "password_hash"> | null;
}

export default function ProjectFeed({
  initialProjects,
  demoUsers,
  currentUser,
}: ProjectFeedProps) {
  const [sort, setSort] = useState<"trending" | "recent" | "stars" | "views">("trending");
  const [tag, setTag] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
    <div>
      <FilterBar
        currentSort={sort}
        currentTag={tag}
        searchQuery={search}
        onSortChange={setSort}
        onTagChange={setTag}
        onSearchChange={setSearch}
      />

      {filteredProjects.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
          <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No projects found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or stack filters to find what you&apos;re looking for.
          </p>
          <button
            onClick={() => {
              setTag("All");
              setSearch("");
            }}
            className="mt-4 px-4 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-slate-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onRequireAuth={() => setIsAuthModalOpen(true)}
            />
          ))}
        </div>
      )}

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          demoUsers={demoUsers}
        />
      )}
    </div>
  );
}
