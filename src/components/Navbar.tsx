"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { Plus, LogIn, LogOut, User as UserIcon, Code2, ChevronDown } from "lucide-react";
import { logoutAction } from "@/app/actions";
import { DbUser } from "@/lib/db";
import { useToast } from "./Toast";
import ProjectModalStudio from "./ProjectModalStudio";
import AuthModal from "./AuthModal";
import Avatar from "./Avatar";

interface NavbarProps {
  currentUser: Omit<DbUser, "password_hash"> | null;
}

export default function Navbar({ currentUser }: NavbarProps) {
  const [isPending, startTransition] = useTransition();
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { toast } = useToast();

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
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
      <header className="sticky top-0 z-50 w-full px-3 pt-3 sm:px-5">
        <div className="mx-auto max-w-7xl">
          <div className="relative flex h-16 items-center justify-between gap-2 rounded-2xl border border-white/[0.08] bg-[#090a12]/80 px-2.5 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.95)] backdrop-blur-2xl sm:gap-4 sm:px-5">
          <div className="pointer-events-none absolute inset-x-10 -bottom-px h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
          
          {/* Logo & Brand */}
          <Link href="/" aria-label="DevCraft home" className="group flex shrink-0 items-center gap-2.5 sm:gap-3">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 p-[1px] shadow-[0_0_35px_-10px_rgba(139,92,246,0.9)] group-hover:shadow-[0_0_42px_-8px_rgba(34,211,238,0.6)] transition-all duration-500 group-hover:scale-105">
              <div className="w-full h-full bg-[#080a12] rounded-[15px] flex items-center justify-center">
                <Code2 className="w-5 h-5 text-violet-300 group-hover:text-cyan-300 group-hover:rotate-6 transition-all duration-500" />
              </div>
            </div>
            <div className="hidden flex-col min-[360px]:flex">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-violet-100 transition-colors">
                DevCraft
              </span>
              <span className="text-[9px] text-violet-300/80 font-semibold tracking-[0.22em] uppercase -mt-0.5 flex items-center gap-1.5">
                Showcase
                <span className="h-1 w-1 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
              </span>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Publish Project CTA */}
            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  setIsAuthOpen(true);
                } else {
                  setIsPublishOpen(true);
                }
              }}
              className="group/btn relative flex cursor-pointer items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-xl bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 px-3 py-2 text-xs font-semibold text-white ring-1 ring-inset ring-white/15 shadow-[0_10px_35px_-12px_rgba(139,92,246,0.9)] transition-all hover:shadow-[0_12px_45px_-12px_rgba(139,92,246,1)] hover:brightness-110 active:scale-[0.98] sm:px-4"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
              <Plus className="relative w-3.5 h-3.5 shrink-0" />
              <span className="relative hidden sm:inline">Publish Project</span>
              <span className="relative sm:hidden">Publish</span>
            </button>

            {/* User Profile or Sign In */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  aria-label={`User menu for ${currentUser.name}`}
                  aria-expanded={isUserMenuOpen}
                  className={`flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full border transition-all ${
                    isUserMenuOpen
                      ? "bg-violet-500/15 border-violet-400/50 shadow-[0_0_24px_-8px_rgba(139,92,246,0.8)]"
                      : "bg-white/[0.04] hover:bg-white/[0.07] border-white/10 hover:border-white/20"
                  }`}
                >
                  <span className="rounded-full bg-gradient-to-br from-violet-400 via-fuchsia-400 to-cyan-300 p-[1px]">
                    <Avatar
                      src={currentUser.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`}
                      name={currentUser.name}
                      className="h-6 w-6 rounded-full border border-[#090a12] object-cover"
                      textClassName="text-[8px]"
                    />
                  </span>
                  <span className="text-xs font-medium text-slate-200 hidden sm:inline max-w-[100px] truncate">
                    {currentUser.name}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180 text-violet-400" : ""}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-white/10 bg-[#0b0d16]/95 py-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur-2xl z-50 animate-dropdown-right">
                    <div className="px-4 py-2.5 border-b border-white/[0.06]">
                      <div className="font-semibold text-xs text-white">{currentUser.name}</div>
                      <div className="text-[11px] text-violet-300 font-mono">@{currentUser.username}</div>
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
                      type="button"
                      disabled={isPending}
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
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2 text-xs font-medium text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all hover:border-violet-400/40 hover:bg-white/[0.07] hover:text-white sm:px-3.5"
              >
                <LogIn className="w-3.5 h-3.5 text-violet-300" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
        </div>
      </header>

      {/* Modals */}
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
        />
      )}
    </>
  );
}
