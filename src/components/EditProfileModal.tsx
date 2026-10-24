"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Sparkles,
  Upload,
  User,
  Briefcase,
  Globe,
  Check,
  RefreshCw,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { GithubIcon } from "./Icons";
import { DbUser } from "@/lib/db";
import { updateProfileAction } from "@/app/actions";
import { useToast } from "./Toast";
import { compressImageFile } from "@/lib/imageUtils";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [bio, setBio] = useState(user.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || "");
  const [githubUrl, setGithubUrl] = useState(user.github_url || "");
  const [websiteUrl, setWebsiteUrl] = useState(user.website_url || "");

  const [avatarTab, setAvatarTab] = useState<"upload" | "url">("upload");
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadStats, setUploadStats] = useState<string | null>(
    user.avatar_url?.startsWith("data:image/")
      ? `${(user.avatar_url.length * 0.75 / 1024).toFixed(1)} KB`
      : null
  );
  const [isDragging, setIsDragging] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setError(null);
    setIsCompressing(true);
    try {
      const dataUrl = await compressImageFile(file, 256);
      setAvatarUrl(dataUrl);
      const sizeKb = (dataUrl.length * 0.75 / 1024).toFixed(1);
      setUploadStats(`${sizeKb} KB`);
      toast({
        title: "Photo Loaded & Optimized",
        message: `Image ready (${sizeKb} KB). Click Save to publish.`,
        type: "success",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to process image";
      setError(message);
      toast({
        title: "Image Error",
        message,
        type: "error",
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    // reset input value so re-uploading same file triggers change
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleRandomAvatar = () => {
    const seed = Math.random().toString(36).substring(2, 8);
    const botUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
    setAvatarUrl(botUrl);
    setUploadStats(null);
  };

  const handlePresetSelect = (url: string) => {
    setAvatarUrl(url);
    setUploadStats(null);
  };

  const handleClearAvatar = () => {
    const defaultBot = `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`;
    setAvatarUrl(defaultBot);
    setUploadStats(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("avatarUrl", avatarUrl);
    formData.set("name", name.trim());
    formData.set("role", role.trim());
    formData.set("bio", bio.trim());
    formData.set("githubUrl", githubUrl.trim());
    formData.set("websiteUrl", websiteUrl.trim());

    startTransition(async () => {
      const res = await updateProfileAction(formData);
      if (res.error) {
        setError(res.error);
      } else {
        toast({
          title: "Profile Updated",
          message: "Your new avatar and creator details are live!",
          type: "success",
        });
        router.refresh();
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl max-h-[92vh] rounded-2xl bg-[#0c0e17] border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-modal">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-white/[0.08] flex items-center justify-between shrink-0">
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
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Avatar Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300">
                  Profile Avatar
                </label>
                {uploadStats && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                    <CheckCircle2 className="w-3 h-3" />
                    Uploaded ({uploadStats})
                  </span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {/* Current Preview */}
                  <div className="relative group shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                      alt="Avatar preview"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-violet-500/50 shadow-lg"
                    />
                    {isCompressing && (
                      <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center text-[10px] text-violet-300 font-semibold">
                        Optimizing...
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-3">
                    {/* Method Switcher Tabs */}
                    <div className="flex items-center p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs">
                      <button
                        type="button"
                        onClick={() => setAvatarTab("upload")}
                        className={`flex-1 py-1 px-2.5 rounded-md text-center font-medium transition-all flex items-center justify-center gap-1.5 ${
                          avatarTab === "upload"
                            ? "bg-violet-600 text-white shadow-sm font-semibold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvatarTab("url")}
                        className={`flex-1 py-1 px-2.5 rounded-md text-center font-medium transition-all flex items-center justify-center gap-1.5 ${
                          avatarTab === "url"
                            ? "bg-violet-600 text-white shadow-sm font-semibold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>Image URL & Presets</span>
                      </button>
                    </div>

                    {/* Tab 1: File Upload */}
                    {avatarTab === "upload" ? (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                          isDragging
                            ? "border-violet-500 bg-violet-500/10 scale-[1.01]"
                            : "border-white/10 hover:border-violet-500/50 hover:bg-white/[0.02]"
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          onChange={handleFileChange}
                          className="hidden"
                          aria-label="Upload avatar file"
                        />
                        <Upload className="w-5 h-5 text-violet-400 mx-auto mb-1.5" />
                        <div className="text-xs font-semibold text-slate-200">
                          Click to browse or drag & drop image
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          PNG, JPG, WebP, GIF (auto-resized & optimized)
                        </div>
                      </div>
                    ) : (
                      /* Tab 2: Manual URL and Presets */
                      <div className="space-y-3">
                        <div className="relative">
                          <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            name="avatarUrl"
                            type="url"
                            value={avatarUrl.startsWith("data:") ? "" : avatarUrl}
                            onChange={(e) => {
                              setAvatarUrl(e.target.value);
                              setUploadStats(null);
                            }}
                            placeholder="Paste image URL (https://...)"
                            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500 font-mono"
                          />
                        </div>

                        {/* Presets row */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">Presets:</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {PRESET_AVATARS.map((url, i) => (
                              <button
                                key={i}
                                type="button"
                                aria-label={`Select avatar preset ${i + 1}`}
                                onClick={() => handlePresetSelect(url)}
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
                              <span>Random</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reset Button */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleClearAvatar}
                        className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        Reset to default bot
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
                    maxLength={80}
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
                    maxLength={80}
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
                <span className="text-[10px] text-slate-400 font-mono">
                  {bio.length}/2000 chars
                </span>
              </div>
              <textarea
                name="bio"
                rows={4}
                maxLength={2000}
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
        <div className="px-5 sm:px-6 py-4 border-t border-white/[0.08] bg-[#090b12] flex items-center justify-between shrink-0">
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
            disabled={isPending || isCompressing}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isPending ? "Saving Changes..." : isCompressing ? "Optimizing..." : "Save Profile"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
