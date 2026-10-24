"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Plus, LogIn, LogOut, User as UserIcon, Code2, Users, ChevronDown, Check } from "lucide-react";
import { switchDemoUserAction, logoutAction } from "@/app/actions";
import { DbUser } from "@/lib/db";
import { useToast } from "./Toast";
import ProjectModalStudio from "./ProjectModalStudio";
import AuthModal from "./AuthModal";

interface NavbarProps {
  currentUser: Omit<DbUser, "password_hash"> | null;
  demoUsers: Omit<DbUser, "password_hash">[];
}

export default function Navbar({ currentUser, demoUsers }: NavbarProps) {
  const [isPending, startTransition] = useTransition();
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDemoDropdownOpen, setIsDemoDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { toast } = useToast();

  const demoDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (demoDropdownRef.current && !demoDropdownRef.current.contains(target)) {
        setIsDemoDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDemoDropdownOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSwitchUser = (user: Omit<DbUser, "password_hash">) => {
    startTransition(async () => {
      await switchDemoUserAction(user.id);
      setIsDemoDropdownOpen(false);
      toast({
        title: `Switched Persona to ${user.name}`,
        message: `Now acting as ${user.role} (@${user.username})`,
        type: "success",
        avatar: user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`,
      });
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      setIsUserMenuOpen(false);
      toast({
        title: "Signed Out",
        message: "You are now browsing DevCraft as a guest.",
        type: "info",
      });
    });
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#08090e]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full bg-[#0c0e17] rounded-[11px] flex items-center justify-center">
                <Code2 className="w-5 h-5 text-violet-400 group-hover:text-cyan-400 group-hover:rotate-6 transition-all duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent group-hover:from-violet-200 group-hover:to-cyan-200 transition-all">
                DevCraft
              </span>
              <span className="text-[10px] text-violet-400 font-medium tracking-wider uppercase -mt-1 flex items-center gap-1">
                Showcase <Sparkles className="w-2.5 h-2.5 animate-pulse" />
              </span>
            </div>
          </Link>

          {/* Quick-Switch Demo Persona Dropdown with outside-click ref */}
          <div className="relative" ref={demoDropdownRef}>
            <button
              onClick={() => {
                setIsDemoDropdownOpen((prev) => !prev);
                setIsUserMenuOpen(false);
              }}
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                isDemoDropdownOpen
                  ? "bg-violet-600/20 border-violet-500/50 text-white shadow-md shadow-violet-600/20"
                  : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300 hover:text-white"
              }`}
              title="Quick-switch between demo creator personas"
            >
              <Users className="w-3.5 h-3.5 text-violet-400" />
              <span>Switch Persona</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isDemoDropdownOpen ? "rotate-180 text-violet-400" : ""}`} />
            </button>

            {isDemoDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#0f121d]/95 border border-white/10 shadow-2xl py-2 z-50 backdrop-blur-2xl animate-dropdown">
                <div className="px-3.5 py-1.5 border-b border-white/[0.06] flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Demo Personas</span>
                  <span className="text-[10px] text-violet-400 font-mono">1-Click</span>
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {demoUsers.map((u) => {
                    const isCurrent = currentUser?.id === u.id;
                    return (
                      <button
                        key={u.id}
                        disabled={isPending}
                        onClick={() => handleSwitchUser(u)}
                        className={`w-full px-3.5 py-2.5 text-left flex items-center gap-3 hover:bg-violet-600/15 transition-all group ${
                          isCurrent ? "bg-violet-600/20 border-l-2 border-violet-500" : ""
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={u.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-white/10 group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                              {u.name}
                            </span>
                            {isCurrent && <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
                          </div>
                          <span className="text-[11px] text-slate-400 truncate block">{u.role}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Publish Project CTA with hover glow */}
            <button
              onClick={() => {
                if (!currentUser) {
                  setIsAuthOpen(true);
                } else {
                  setIsPublishOpen(true);
                }
              }}
              className="relative group overflow-hidden flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 hover:scale-[1.02] active:scale-[0.98] text-white text-xs font-semibold shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40 transition-all cursor-pointer"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Plus className="w-3.5 h-3.5" />
              <span>Publish Project</span>
            </button>

            {/* User Profile or Sign In */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => {
                    setIsUserMenuOpen((prev) => !prev);
                    setIsDemoDropdownOpen(false);
                  }}
                  className={`flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full border transition-all ${
                    isUserMenuOpen
                      ? "bg-violet-600/20 border-violet-500/50 shadow-md shadow-violet-600/20"
                      : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentUser.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover border border-white/20"
                  />
                  <span className="text-xs font-medium text-slate-200 hidden sm:inline max-w-[100px] truncate">
                    {currentUser.name}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180 text-violet-400" : ""}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0f121d]/95 border border-white/10 shadow-2xl py-2 z-50 backdrop-blur-2xl animate-dropdown-right">
                    <div className="px-4 py-2 border-b border-white/[0.06]">
                      <div className="font-semibold text-xs text-white">{currentUser.name}</div>
                      <div className="text-[11px] text-violet-400 font-mono">@{currentUser.username}</div>
                    </div>
                    <Link
                      href={`/creators/${currentUser.username}`}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full px-4 py-2 text-left flex items-center gap-2 text-xs text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Profile & Projects</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left flex items-center gap-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-200 hover:text-white hover:border-violet-500/40 transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-violet-400" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Modals with smooth animation */}
      {isPublishOpen && (
        <ProjectModalStudio
          isOpen={isPublishOpen}
          onClose={() => setIsPublishOpen(false)}
          currentUser={currentUser}
        />
      )}

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
