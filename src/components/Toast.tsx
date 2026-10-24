"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, Sparkles, AlertCircle, X } from "lucide-react";

interface Toast {
  id: string;
  title: string;
  message?: string;
  type?: "success" | "info" | "error";
  avatar?: string;
}

interface ToastContextType {
  toast: (options: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, message, type = "success", avatar }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type, avatar }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto rounded-2xl bg-[#0e111c]/95 border border-white/10 shadow-2xl p-3.5 flex items-start gap-3 backdrop-blur-xl animate-dropdown transition-all"
          >
            {t.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={t.avatar}
                alt=""
                className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
              />
            ) : t.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : t.type === "info" ? (
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white tracking-tight">{t.title}</div>
              {t.message && <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{t.message}</div>}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      // Fallback if rendered outside provider
      toast: () => {},
    };
  }
  return context;
}
