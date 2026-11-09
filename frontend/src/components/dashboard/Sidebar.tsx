"use client";

import React from "react";
import {
  Bell,
  Code2,
  History,
  LogOut,
  Settings,
  Swords,
  X,
} from "lucide-react";
import { DashboardView, UserProfile } from "@/types";
import CodeforcesLogo from "../common/CodeforcesLogo";

interface SidebarProps {
  activeView: DashboardView;
  profile: UserProfile;
  unreadCount?: number;
  mobileOpen: boolean;
  onSelectView: (view: DashboardView) => void;
  onCloseMobile: () => void;
  onRequestSignOut: () => void;
}

interface NavItem {
  id: DashboardView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: "challenge", label: "1v1 Challenge", icon: Swords },
  { id: "history", label: "Match History", icon: History },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

/**
 * Sidebar Component
 * Supports desktop persistent navigation and responsive mobile slide-over drawer
 * with full Light/Dark mode styling and sign-out confirmation trigger.
 */
export default function Sidebar({
  activeView,
  profile,
  unreadCount = 2,
  mobileOpen,
  onSelectView,
  onCloseMobile,
  onRequestSignOut,
}: SidebarProps) {
  function handleNavClick(view: DashboardView) {
    onSelectView(view);
    onCloseMobile();
  }

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4 sm:p-5">
      {/* Top: Brand Header */}
      <div>
        <div className="flex items-center justify-between pb-6 mb-2 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/25">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Lockout
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Tournament
              </span>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation drawer"
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 dark:border-white/[0.08] dark:bg-[#161a25] dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="mt-4">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Workspace
          </p>

          <nav className="space-y-1.5" aria-label="Main Navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm dark:bg-indigo-600/15 dark:text-white dark:border-indigo-500/30"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[#161a25] dark:hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4.5 w-4.5 transition-colors ${
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.id === "notifications" && unreadCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom: User Card & Sign Out */}
      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/[0.06] dark:bg-[#12151e]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-xs font-bold text-white shadow-sm">
              {(profile.fullName || profile.username || "U").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                {profile.fullName || profile.username}
              </strong>
              <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500 truncate">
                <CodeforcesLogo size="sm" />
                <span>{profile.codeforcesHandle ? `@${profile.codeforcesHandle}` : `@${profile.username}`}</span>
              </span>
            </div>
          </div>

          {/* Sign Out Button - Triggers Confirmation Pop-up */}
          <button
            type="button"
            onClick={onRequestSignOut}
            title="Sign out of account"
            aria-label="Sign out of Lockout"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/15 dark:hover:text-rose-300 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 flex-col fixed inset-y-0 left-0 z-30 border-r border-slate-200 bg-white transition-colors duration-200 dark:border-white/[0.07] dark:bg-[#0e1118]">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Responsive Slide-Over Drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          mobileOpen ? "visible" : "invisible pointer-events-none"
        }`}
        aria-modal="true"
        role="dialog"
      >
        {/* Backdrop overlay */}
        <div
          onClick={onCloseMobile}
          className={`absolute inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />

        {/* Drawer panel */}
        <div
          className={`absolute inset-y-0 left-0 w-[280px] max-w-[85vw] bg-white border-r border-slate-200 shadow-2xl transition-transform duration-300 ease-out dark:bg-[#0e1118] dark:border-white/[0.08] ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
