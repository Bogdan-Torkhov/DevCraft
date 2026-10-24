"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-2xl bg-[#0c0e17] border border-white/10 shadow-2xl p-6 relative overflow-hidden animate-modal"
      >
        {/* Glow ambient background */}
        <div
          className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-20 ${
            variant === "danger" ? "bg-rose-500" : "bg-amber-500"
          }`}
        />

        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={isPending}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          {/* Icon Badge */}
          <div
            className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center border ${
              variant === "danger"
                ? "bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-lg shadow-rose-500/10"
                : "bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10"
            }`}
          >
            {variant === "danger" ? (
              <Trash2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <h3
              id="confirm-modal-title"
              className="text-base font-bold text-white leading-snug"
            >
              {title}
            </h3>
            <p
              id="confirm-modal-desc"
              className="mt-2 text-xs text-slate-300 leading-relaxed font-normal"
            >
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 min-h-[36px] rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={`flex items-center gap-2 px-5 py-2 min-h-[36px] rounded-xl text-xs font-semibold text-white shadow-lg transition-all cursor-pointer disabled:opacity-50 ${
              variant === "danger"
                ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30"
                : "bg-amber-600 hover:bg-amber-500 shadow-amber-600/30"
            }`}
          >
            {isPending && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span>{isPending ? "Processing..." : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
