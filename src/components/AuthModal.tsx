"use client";

import { useState, useTransition } from "react";
import { X, Sparkles, Users, LogIn, UserPlus, Check } from "lucide-react";
import { DbUser } from "@/lib/db";
import { switchDemoUserAction, loginAction, registerAction } from "@/app/actions";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  demoUsers: Omit<DbUser, "password_hash">[];
}

export default function AuthModal({ isOpen, onClose, demoUsers }: AuthModalProps) {
  const [tab, setTab] = useState<"demo" | "login" | "register">("demo");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDemoSwitch = (userId: string) => {
    startTransition(async () => {
      await switchDemoUserAction(userId);
      onClose();
    });
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await loginAction(formData);
      if (res.error) {
        setError(res.error);
      } else {
        onClose();
      }
    });
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await registerAction(formData);
      if (res.error) {
        setError(res.error);
      } else {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl bg-[#0c0e17] border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-modal">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h2 className="text-base font-bold text-white">Join DevCraft Community</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="px-6 pt-4 pb-2 border-b border-white/[0.06] bg-[#090b12] flex items-center gap-1">
          <button
            onClick={() => { setTab("demo"); setError(null); }}
            className={`flex-1 py-2 text-center rounded-lg text-xs font-semibold transition-all ${
              tab === "demo"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            1-Click Demo
          </button>
          <button
            onClick={() => { setTab("login"); setError(null); }}
            className={`flex-1 py-2 text-center rounded-lg text-xs font-semibold transition-all ${
              tab === "login"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab("register"); setError(null); }}
            className={`flex-1 py-2 text-center rounded-lg text-xs font-semibold transition-all ${
              tab === "register"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              {error}
            </div>
          )}

          {tab === "demo" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-2">
                Instantly explore DevCraft as a pre-configured creator persona with existing projects and stars:
              </p>
              {demoUsers.map((u) => (
                <button
                  key={u.id}
                  disabled={isPending}
                  onClick={() => handleDemoSwitch(u.id)}
                  className="w-full p-3 rounded-xl bg-white/[0.03] hover:bg-violet-600/15 border border-white/[0.06] hover:border-violet-500/40 text-left flex items-center gap-3.5 transition-all group cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={u.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">
                        {u.name}
                      </span>
                      <span className="text-[10px] text-violet-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                        Select →
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block truncate">{u.role}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email or Username
                </label>
                <input
                  name="emailOrUsername"
                  type="text"
                  required
                  placeholder="elena@devcraft.io or elena_design"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password (Demo password: devcraft123)
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  defaultValue="devcraft123"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending ? "Authenticating..." : "Sign In to DevCraft"}
              </button>
            </form>
          )}

          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Ada Lovelace"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
                <input
                  name="username"
                  type="text"
                  required
                  placeholder="ada_code"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="ada@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role / Headline</label>
                <input
                  name="role"
                  type="text"
                  placeholder="e.g. Creative Technologist"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending ? "Creating Account..." : "Create Free Account"}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
