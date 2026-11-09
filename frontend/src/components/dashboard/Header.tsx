"use client";

import React from "react";
import { Bell, Menu, ShieldCheck, Swords } from "lucide-react";
import { DashboardView, UserProfile } from "@/types";
import CodeforcesLogo from "../common/CodeforcesLogo";
import ThemeToggle from "../common/ThemeToggle";

interface HeaderProps {
  activeView: DashboardView;
  profile: UserProfile;
  unreadNotificationsCount?: number;
  onOpenMobileMenu: () => void;
  onSelectView: (view: DashboardView) => void;
}

const VIEW_TITLES: Record<DashboardView, { title: string; subtitle: string }> = {
  challenge: {
    title: "1v1 Lockout Challenge",
    subtitle: "Configure and launch a head-to-head race on Codeforces problems",
  },
  history: {
    title: "Match History",
    subtitle: "Review your recent face-offs, ratings delta, and tournament stats",
  },
  notifications: {
    title: "Notifications & Alerts",
    subtitle: "Incoming duels, challenge results, and rating adjustments",
  },
  settings: {
    title: "Profile & Preferences",
    subtitle: "Manage your competitive credentials and account details",
  },
};

/**
 * Header Component
 * Sticky top navigation bar with dynamic titles, live CF status,
 * theme toggle, notification counter, and mobile menu trigger.
 */
export default function Header({
  activeView,
  profile,
  unreadNotificationsCount = 2,
  onOpenMobileMenu,
  onSelectView,
}: HeaderProps) {
  const current = VIEW_TITLES[activeView];

  return (
    <header className="sticky top-0 z-20 flex h-16 sm:h-20 w-full items-center justify-between border-b border-slate-200 bg-white/85 px-4 sm:px-6 lg:px-8 backdrop-blur-md transition-colors duration-200 dark:border-white/[0.07] dark:bg-[#0d0f15]/85">
      {/* Left: Mobile Menu Trigger + View Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="flex lg:hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition active:scale-95 cursor-pointer dark:border-white/[0.08] dark:bg-[#161a25] dark:text-slate-300 dark:hover:text-white dark:hover:bg-[#1e2333]"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>{current.title}</span>
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Status Pill & Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Codeforces Connected Pill */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100/70 px-3 py-1.5 text-xs text-slate-700 shadow-sm dark:border-white/[0.08] dark:bg-[#141722] dark:text-slate-300">
          <CodeforcesLogo size="sm" />
          <span className="font-mono text-slate-900 dark:text-slate-200 text-[11px] font-semibold">
            {profile.codeforcesHandle ? `@${profile.codeforcesHandle}` : `@${profile.username}`}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" />
        </div>

        {/* Theme Toggle (Light / Dark) */}
        <ThemeToggle />

        {/* Notifications Icon Button */}
        <button
          type="button"
          onClick={() => onSelectView("notifications")}
          aria-label={`Open notifications, ${unreadNotificationsCount} unread`}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95 cursor-pointer dark:border-white/[0.08] dark:bg-[#161a25] dark:text-slate-300 dark:hover:bg-[#1e2333] dark:hover:text-white"
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white ring-2 ring-white dark:ring-[#0d0f15]">
              {unreadNotificationsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
