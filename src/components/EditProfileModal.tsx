"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, Image as ImageIcon, User, Briefcase, Globe, Check, RefreshCw } from "lucide-react";
import { GithubIcon } from "./Icons";
import { DbUser } from "@/lib/db";
import { updateProfileAction } from "@/app/actions";
import { useToast } from "./Toast";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Omit<DbUser, "password_hash">;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
];

export default function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [bio, setBio] = useState(user.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || "");
  const [githubUrl, setGithubUrl] = useState(user.github_url || "");
  const [websiteUrl, setWebsiteUrl] = useState(user.website_url || "");

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleRandomAvatar = () => {
    const seed = Math.random().toString(36).substring(2, 8);
    setAvatarUrl(`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    if (!formData.get("avatarUrl") && avatarUrl) {
      formData.set("avatarUrl", avatarUrl);
    }
    if (!formData.get("bio") && bio) {
      formData.set("bio", bio);
    }
    if (!formData.get("role") && role) {
      formData.set("role", role);
    }
    if (!formData.get("name") && name) {
      formData.set("name", name);
    }

    startTransition(async () => {
      const res = await updateProfileAction(formData);
      if (res.error) {
        setError(res.error);
      } else {
        toast({
          title: "Profile Updated",
          message: "Your new avatar and about me details are live!",
          type: "success",
        });
        router.refresh();
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl max-h-[90vh] rounded-2xl bg-[#0c0e17] border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-modal">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h2 className="text-base font-bold text-white">Edit Creator Profile</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close edit profile modal"
            className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              {error}
            </div>
          )}

          <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Avatar Selector Section */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Creator Avatar
              </label>
              
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                {/* Current Preview */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                  alt="Avatar preview"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-violet-500/50 shadow-lg shrink-0"
                />

                <div className="flex-1 space-y-2">
                  <div className="relative">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      name="avatarUrl"
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500 font-mono"
                    />
                  </div>

                  {/* Preset quick picks */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Presets:</span>
                    <div className="flex items-center gap-1.5">
                      {PRESET_AVATARS.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAvatarUrl(url)}
                          className={`w-6 h-6 rounded-lg overflow-hidden border transition-all ${
                            avatarUrl === url ? "border-violet-400 scale-110" : "border-white/10 opacity-70 hover:opacity-100"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handleRandomAvatar}
                        className="px-2 py-0.5 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-[10px] text-slate-300 flex items-center gap-1 transition-colors"
                        title="Generate random bot avatar"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>Random Bot</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Name and Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Headline / Role</label>
                <div className="relative">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    name="role"
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Design Systems Lead"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>

            {/* About Me / Bio */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  About Me & Bio
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  Markdown supported
                </span>
              </div>
              <textarea
                name="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your background, design philosophy, tech stack proficiencies, and current interests..."
                className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500 resize-none leading-relaxed"
              />
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Website URL</label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    name="websiteUrl"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://mysite.dev"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">GitHub Profile</label>
                <div className="relative">
                  <GithubIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    name="githubUrl"
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/myname"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-[#090b12] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="edit-profile-form"
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isPending ? "Saving Changes..." : "Save Profile"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
