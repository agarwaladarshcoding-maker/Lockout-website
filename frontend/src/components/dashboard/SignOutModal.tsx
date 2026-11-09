"use client";

import React, { useEffect } from "react";
import { AlertTriangle, LogOut, X } from "lucide-react";

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userHandle?: string;
}

/**
 * SignOutModal Component
 * Accessible, responsive confirmation dialog prompting the competitor
 * before ending their active Lockout session.
 */
export default function SignOutModal({
  isOpen,
  onClose,
  onConfirm,
  userHandle = "competitor",
}: SignOutModalProps) {
  // Handle escape key to dismiss
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sign-out-title"
      aria-describedby="sign-out-desc"
    >
      {/* Backdrop overlay with blur */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all animate-scale-up dark:border-white/[0.08] dark:bg-[#141722] dark:shadow-black/70">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-[#1e2333] dark:hover:text-white transition cursor-pointer"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Warning Icon Badge */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-400">
            <LogOut className="h-6 w-6" />
          </div>
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-500/20">
              Session Action
            </span>
            <h3
              id="sign-out-title"
              className="text-lg font-bold text-slate-900 dark:text-white mt-0.5"
            >
              Sign out of Lockout?
            </h3>
          </div>
        </div>

        {/* Prominent Warning Message */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5 dark:border-rose-500/20 dark:bg-rose-500/10 mb-4">
          <p className="text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-none" />
            <span>You are going to sign out.</span>
          </p>
        </div>

        {/* Description */}
        <p
          id="sign-out-desc"
          className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6"
        >
          You are currently signed in as <strong className="text-slate-900 dark:text-white font-mono">@{userHandle}</strong>. Any active match configuration will be discarded, and you will need to re-authenticate to launch new head-to-head duels.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/[0.08] dark:bg-[#1c202e] dark:text-slate-300 dark:hover:bg-[#252b3d] dark:hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-rose-600/25 hover:bg-rose-500 active:scale-[0.99] transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Yes, Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

