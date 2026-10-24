"use client";

import { useState, useTransition } from "react";
import { MessageSquare, Send, Sparkles } from "lucide-react";
import { DbComment, DbUser } from "@/lib/db";
import { addCommentAction } from "@/app/actions";

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
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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
        <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 text-xs font-semibold border border-violet-500/20">
          {comments.length} Comments
        </span>
      </div>

      {/* New comment input box */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          {currentUser ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentUser.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10"
            />
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
                  : "Sign in or switch demo persona to comment..."
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
          comments.map((c) => (
            <div key={c.id} className="flex gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.user_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${c.user_username}`}
                alt={c.user_name}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{c.user_name}</span>
                    <span className="text-[10px] text-slate-500">@{c.user_username}</span>
                    <span className="px-1.5 py-0.2 rounded bg-white/[0.05] text-[10px] text-violet-400 font-medium">
                      {c.user_role}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {new Date(c.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-300 leading-relaxed break-words">{c.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
