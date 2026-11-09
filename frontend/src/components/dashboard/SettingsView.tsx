"use client";

import React, { FormEvent, useState } from "react";
import { Check, CheckCircle2, ExternalLink, Moon, Sun } from "lucide-react";
import { UserProfile } from "@/types";
import CodeforcesLogo from "../common/CodeforcesLogo";
import { useTheme } from "@/context/ThemeContext";

interface SettingsViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

/**
 * SettingsView Component
 * Manages user profile attributes, verified Codeforces linkage,
 * and appearance preferences (Light/Dark mode) with full responsive styling.
 */
export default function SettingsView({
  profile,
  onUpdateProfile,
}: SettingsViewProps) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [username, setUsername] = useState(profile.username);
  const [email, setEmail] = useState(profile.email);
  const [saved, setSaved] = useState(false);
  const { theme, toggleTheme } = useTheme();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      fullName: fullName.trim(),
      username: username.trim(),
      email: email.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* 1. Profile Settings Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors duration-200 dark:border-white/[0.08] dark:bg-[#12151e] dark:shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5 sm:p-6 bg-slate-50/70 dark:border-white/[0.06] dark:bg-[#161a25]/50">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Account Preferences
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Profile Settings
            </h2>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs text-emerald-700 font-medium dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Verified CP Athlete</span>
          </div>
        </div>

        {/* Profile Card Banner */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/[0.06] flex items-center gap-4">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 flex-none items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-xl font-black text-white shadow-lg shadow-indigo-500/25">
            {(fullName || username || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {fullName || username || "Competitor"}
            </h3>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">@{username || "username"}</p>
            <span className="inline-block mt-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
              Lockout Member since Nov 2026
            </span>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="settings-fullname" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                id="settings-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 transition focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-[#0b0d14] dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="settings-username" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                Username
              </label>
              <input
                id="settings-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-mono transition focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-[#0b0d14] dark:text-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="settings-email" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
              Email Address
            </label>
            <input
              id="settings-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 transition focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-[#0b0d14] dark:text-white"
            />
          </div>

          {/* Connected Codeforces Handle */}
          <div>
            <label htmlFor="settings-cf" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
              Connected Codeforces Handle
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 flex items-center gap-1.5">
                <CodeforcesLogo size="sm" />
              </span>
              <input
                id="settings-cf"
                type="text"
                readOnly
                value={profile.codeforcesHandle}
                className="w-full rounded-xl border border-slate-200 bg-slate-100/70 pl-11 pr-32 py-2.5 text-xs sm:text-sm font-mono text-slate-700 cursor-not-allowed select-all dark:border-white/[0.08] dark:bg-[#0b0d14]/60 dark:text-slate-300"
              />
              <div className="absolute right-3 flex items-center gap-2">
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-400">
                  Linked
                </span>
                <a
                  href={`https://codeforces.com/profile/${profile.codeforcesHandle}`}
                  target="_blank"
                  rel="noreferrer"
                  title="View profile on Codeforces"
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">
              Handle changes require security re-verification via compilation challenge.
            </p>
          </div>
        </div>

        {/* Save Bar */}
        <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-[#161a25]/50 flex items-center justify-end border-t border-slate-200 dark:border-white/[0.06]">
          <button
            type="submit"
            className={`flex items-center gap-2 rounded-xl py-2.5 px-5 text-xs sm:text-sm font-semibold text-white shadow-lg transition-all duration-200 cursor-pointer ${
              saved
                ? "bg-emerald-600 shadow-emerald-600/20"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 active:scale-95"
            }`}
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                <span>Changes Saved ✓</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>

      {/* 2. Theme & Display Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition-colors duration-200 dark:border-white/[0.08] dark:bg-[#12151e]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Interface Theme
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Choose between clean Light Mode and focused Dark Mode.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1 border border-slate-200 dark:bg-[#0b0d14] dark:border-white/[0.05]">
            <button
              type="button"
              onClick={() => theme !== "light" && toggleTheme()}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                theme === "light"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              <span>Light</span>
            </button>

            <button
              type="button"
              onClick={() => theme !== "dark" && toggleTheme()}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                theme === "dark"
                  ? "bg-[#1e2333] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
              <span>Dark</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
