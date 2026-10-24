"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2 } from "lucide-react";
import { ProjectWithAuthor, DbUser } from "@/lib/db";
import { toggleStarAction, deleteProjectAction } from "@/app/actions";
import { useToast } from "@/components/Toast";
import AuthModal from "@/components/AuthModal";
import ConfirmModal from "@/components/ConfirmModal";

interface DetailActionButtonsProps {
  project: ProjectWithAuthor;
  isAuthor: boolean;
  currentUser: Omit<DbUser, "password_hash"> | null;
}

export default function DetailActionButtons({
  project,
  isAuthor,
  currentUser,
}: DetailActionButtonsProps) {
  const router = useRouter();
  const [hasStarred, setHasStarred] = useState(project.has_starred ?? false);
  const [starsCount, setStarsCount] = useState(project.stars_count);
  const [isStarPopping, setIsStarPopping] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleStar = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    const nextStarred = !hasStarred;
    setHasStarred(nextStarred);
    setStarsCount((prev) => (nextStarred ? prev + 1 : Math.max(0, prev - 1)));
    setIsStarPopping(true);
    setTimeout(() => setIsStarPopping(false), 400);

    if (nextStarred) {
      toast({
        title: `Starred ${project.title}`,
        message: "Your endorsement was recorded in the database! ⭐",
        type: "success",
      });
    }

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

  const handleConfirmDelete = () => {
    startTransition(async () => {
      const res = await deleteProjectAction(project.id);
      if (res.success) {
        setIsDeleteModalOpen(false);
        toast({
          title: "Project Deleted",
          message: "The showcase was removed from DevCraft.",
          type: "info",
        });
        router.push("/");
      } else {
        toast({
          title: "Failed to delete project",
          message: res.error || "An error occurred",
          type: "error",
        });
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Star CTA with pop animation */}
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
            className={`w-4 h-4 transition-transform ${
              isStarPopping ? "animate-star-pop fill-amber-400 text-amber-400" : hasStarred ? "fill-amber-400 text-amber-400" : "text-slate-400"
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
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isPending}
            className="p-2.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
            title="Delete this project"
            aria-label="Delete this project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
        />
      )}

      {/* Site-Based Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Project Showcase"
        message={`Are you sure you want to delete "${project.title}"? All peer comments, star ratings, and runnable sandbox assets will be permanently removed.`}
        confirmText="Delete Project"
        cancelText="Keep Project"
        isPending={isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
}
