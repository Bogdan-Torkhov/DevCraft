"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2 } from "lucide-react";
import { ProjectWithAuthor, DbUser } from "@/lib/db";
import { toggleStarAction, deleteProjectAction } from "@/app/actions";
import AuthModal from "@/components/AuthModal";

interface DetailActionButtonsProps {
  project: ProjectWithAuthor;
  isAuthor: boolean;
  currentUser: Omit<DbUser, "password_hash"> | null;
  demoUsers: Omit<DbUser, "password_hash">[];
}

export default function DetailActionButtons({
  project,
  isAuthor,
  currentUser,
  demoUsers,
}: DetailActionButtonsProps) {
  const router = useRouter();
  const [hasStarred, setHasStarred] = useState(project.has_starred ?? false);
  const [starsCount, setStarsCount] = useState(project.stars_count);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleStar = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    const nextStarred = !hasStarred;
    setHasStarred(nextStarred);
    setStarsCount((prev) => (nextStarred ? prev + 1 : Math.max(0, prev - 1)));

    startTransition(async () => {
      const res = await toggleStarAction(project.id);
      if ("error" in res && res.error) {
        setHasStarred(!nextStarred);
        setStarsCount(project.stars_count);
        setIsAuthOpen(true);
      } else if ("totalStars" in res && res.totalStars !== undefined) {
        setStarsCount(res.totalStars);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    startTransition(async () => {
      const res = await deleteProjectAction(project.id);
      if (res.success) {
        router.push("/");
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Star CTA */}
        <button
          onClick={handleStar}
          disabled={isPending}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border shadow-lg ${
            hasStarred
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/10"
              : "bg-white/[0.04] text-slate-300 border-white/[0.08] hover:bg-white/[0.08] hover:text-white"
          }`}
        >
          <Star
            className={`w-4 h-4 ${
              hasStarred ? "fill-amber-400 text-amber-400" : "text-slate-400"
            }`}
          />
          <span>{hasStarred ? "Starred" : "Star Project"}</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-md bg-white/10 text-[11px] font-mono">
            {starsCount}
          </span>
        </button>

        {/* Delete button for author */}
        {isAuthor && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
            title="Delete this project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          demoUsers={demoUsers}
        />
      )}
    </>
  );
}
