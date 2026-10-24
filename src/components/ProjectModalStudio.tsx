"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Code2, Sparkles, Image as ImageIcon, Globe, Eye, Send } from "lucide-react";
import { GithubIcon } from "@/components/Icons";
import { DbUser } from "@/lib/db";
import { createProjectAction } from "@/app/actions";

interface ProjectModalStudioProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Omit<DbUser, "password_hash"> | null;
}

export default function ProjectModalStudio({ isOpen, onClose }: ProjectModalStudioProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("React, Tailwind, CSSArt");
  const [coverImage, setCoverImage] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [codeSnippet, setCodeSnippet] = useState(`<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      background: #090a10;
      color: #fff;
      font-family: sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    .card {
      padding: 30px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 0 30px rgba(139, 92, 246, 0.3);
      text-align: center;
    }
    button {
      margin-top: 15px;
      padding: 8px 16px;
      border-radius: 8px;
      background: #8b5cf6;
      color: white;
      border: none;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>Hello from DevCraft!</h2>
    <p>Interactive runnable component</p>
    <button onclick="alert('Component working!')">Click Me</button>
  </div>
</body>
</html>`);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("tagline", tagline);
    formData.append("description", description);
    formData.append("tags", tags);
    if (coverImage) formData.append("coverImage", coverImage);
    if (demoUrl) formData.append("demoUrl", demoUrl);
    if (githubUrl) formData.append("githubUrl", githubUrl);
    if (codeSnippet) formData.append("codeSnippet", codeSnippet);

    startTransition(async () => {
      const res = await createProjectAction(formData);
      if (res.error) {
        setError(res.error);
      } else if (res.projectId) {
        onClose();
        router.push(`/projects/${res.projectId}`);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-[#0c0e17] border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-modal">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h2 className="text-base font-bold text-white">Publish New Project & Live Component</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close publish modal"
            className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Subtabs */}
        <div className="px-6 py-2 border-b border-white/[0.06] bg-[#090b12] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("edit")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "edit"
                  ? "bg-violet-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Project Details & Code</span>
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "preview"
                  ? "bg-violet-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Sandbox Preview</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              {error}
            </div>
          )}

          {activeTab === "edit" ? (
            <form id="project-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Glowing Matrix Glassmorphism Card"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
                  />
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Short Hook / Tagline *
                  </label>
                  <input
                    type="text"
                    required
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. 3D perspective tilt card with neon glare"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description & Case Study *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the technical decisions, architecture, and inspirations..."
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500 resize-none"
                />
              </div>

              {/* Tags & Cover */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tech Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="React, ThreeJS, Tailwind, Canvas"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cover Image URL (optional)
                  </label>
                  <div className="relative">
                    <ImageIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>

              {/* Demo URL & GitHub */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Live Demo Link (optional)
                  </label>
                  <div className="relative">
                    <Globe className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      value={demoUrl}
                      onChange={(e) => setDemoUrl(e.target.value)}
                      placeholder="https://mycoolproject.app"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    GitHub Repository (optional)
                  </label>
                  <div className="relative">
                    <GithubIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/myname/repo"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>

              {/* Live Runnable Code Snippet */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Runnable Sandbox Code (HTML / CSS / JavaScript)
                  </label>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    Self-contained sandboxed executable
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  className="w-full p-3 font-mono text-xs rounded-xl bg-[#07080d] border border-white/[0.08] text-violet-200 outline-none focus:border-violet-500"
                />
              </div>
            </form>
          ) : (
            <div className="h-[460px] rounded-xl overflow-hidden border border-white/[0.08] bg-[#090a10]">
              <iframe
                title="Preview"
                srcDoc={codeSnippet}
                sandbox="allow-scripts allow-modals"
                className="w-full h-full border-0"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
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
            form="project-form"
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isPending ? "Publishing..." : "Launch Project"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
