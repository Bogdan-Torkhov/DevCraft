"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { MessageSquare, Send, Sparkles, Edit2, Trash2, Check, X } from "lucide-react";
import { DbComment, DbUser } from "@/lib/db";
import { addCommentAction, updateCommentAction, deleteCommentAction } from "@/app/actions";
import { useToast } from "./Toast";

interface CommentSectionProps {
  projectId: string;
  initialComments: DbComment[];
  currentUser: Omit<DbUser, "password_hash"> | null;
  onRequireAuth?: () => void;
}

export default function CommentSection({
  projectId,
  initialComments,
  currentUser,
  onRequireAuth,
}: CommentSectionProps) {
  const [comments, setComments] = useState<DbComment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    if (!newComment.trim()) return;

    setError(null);
    const content = newComment.trim();

    startTransition(async () => {
      const res = await addCommentAction(projectId, content);
      if (res.error) {
        setError(res.error);
      } else if (res.comment) {
        setComments((prev) => [...prev, res.comment]);
        setNewComment("");
        toast({
          title: "Feedback Published",
          message: "Your thoughts were shared with the author and community.",
          type: "success",
        });
      }
    });
  };

  const handleStartEdit = (c: DbComment) => {
    setEditingId(c.id);
    setEditContent(c.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editContent.trim()) return;

    startTransition(async () => {
      const res = await updateCommentAction(commentId, editContent, projectId);
      if (res.error) {
        toast({
          title: "Failed to update comment",
          message: res.error,
          type: "error",
        });
      } else if (res.comment) {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, content: editContent.trim() } : c))
        );
        setEditingId(null);
        toast({
          title: "Comment Updated",
          type: "success",
        });
      }
    });
  };

  const handleDelete = (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    startTransition(async () => {
      const res = await deleteCommentAction(commentId, projectId);
      if (res.error) {
        toast({
          title: "Failed to delete comment",
          message: res.error,
          type: "error",
        });
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        toast({
          title: "Comment Deleted",
          type: "info",
        });
      }
    });
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-violet-400" />
          <h3 className="text-base font-bold text-white">Peer Feedback & Discussion</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 text-xs font-semibold border border-violet-500/20 font-mono">
          {comments.length} Comments
        </span>
      </div>

      {/* New comment input box */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          {currentUser ? (
            <Link href={`/creators/${currentUser.username}`} className="shrink-0 hover:scale-105 transition-transform">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentUser.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-white/10"
              />
            </Link>
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 shrink-0 flex items-center justify-center text-xs text-slate-500">
              ?
            </div>
          )}

          <div className="flex-1 relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                currentUser
                  ? "Share technical feedback, UI critique, or suggestions..."
                  : "Sign in or create an account to share feedback..."
              }
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-violet-500/50 focus:bg-white/[0.06] text-xs text-white placeholder-slate-500 outline-none resize-none transition-all"
            />
          </div>
        </div>

        {error && <p className="text-xs text-rose-400 pl-11">{error}</p>}

        <div className="flex justify-end pl-11">
          <button
            type="submit"
            disabled={isPending || !newComment.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:hover:bg-violet-600 text-white text-xs font-semibold shadow-md shadow-violet-600/20 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Post Feedback</span>
          </button>
        </div>
      </form>

      {/* Existing comments list */}
      <div className="space-y-4 pt-2">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-slate-600" />
            No peer comments yet. Be the first to start the discussion!
          </div>
        ) : (
          comments.map((c) => {
            const isOwner = currentUser?.id === c.user_id;
            const isEditing = editingId === c.id;

            return (
              <div
                key={c.id}
                className="flex gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] group hover:border-white/[0.08] transition-all"
              >
                {/* Clickable user avatar */}
                <Link href={`/creators/${c.user_username}`} className="shrink-0 hover:scale-105 transition-transform">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.user_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${c.user_username}`}
                    alt={c.user_name}
                    className="w-8 h-8 rounded-full object-cover border border-white/10"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/creators/${c.user_username}`}
                        className="text-xs font-semibold text-white hover:text-violet-300 transition-colors"
                      >
                        {c.user_name}
                      </Link>
                      <Link
                        href={`/creators/${c.user_username}`}
                        className="text-[10px] text-violet-400 font-mono hover:underline"
                      >
                        @{c.user_username}
                      </Link>
                      <span className="px-1.5 py-0.2 rounded bg-white/[0.05] text-[10px] text-slate-400 font-medium">
                        {c.user_role}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                        {new Date(c.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>

                      {/* Edit & Delete actions for comment owner */}
                      {isOwner && !isEditing && (
                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleStartEdit(c)}
                            disabled={isPending}
                            className="p-1 rounded hover:bg-white/[0.08] text-slate-400 hover:text-violet-300 transition-colors"
                            title="Edit comment"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            disabled={isPending}
                            className="p-1 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete comment"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comment Content or Edit Form */}
                  {isEditing ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                        className="w-full p-2.5 rounded-lg bg-white/[0.05] border border-violet-500/40 text-xs text-white outline-none resize-none focus:border-violet-400"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={handleCancelEdit}
                          className="px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(c.id)}
                          disabled={isPending || !editContent.trim()}
                          className="flex items-center gap-1 px-3 py-1 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-semibold transition-all"
                        >
                          <Check className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1.5 text-xs text-slate-300 leading-relaxed break-words">{c.content}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
