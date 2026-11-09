"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ChallengeBuilder from "./ChallengeBuilder";
import HistoryView from "./HistoryView";
import NotificationsView from "./NotificationsView";
import SettingsView from "./SettingsView";
import SignOutModal from "./SignOutModal";
import { DashboardView, UserProfile } from "@/types";

interface DashboardProps {
  initialProfile: UserProfile;
  initialView?: DashboardView;
  onLogout: () => void;
}

/**
 * Dashboard Component
 * Coordinates the tournament workspace, sign-out confirmation dialog,
 * navigation drawer, and dynamic view panels with complete Light/Dark ergonomics.
 */
export default function Dashboard({
  initialProfile,
  initialView = "challenge",
  onLogout,
}: DashboardProps) {
  const [activeView, setActiveView] = useState<DashboardView>(initialView);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#0d0f15] dark:text-[#f8fafc] flex">
      {/* 1. Sidebar (Persistent on Desktop, Slide-Over Drawer on Mobile) */}
      <Sidebar
        activeView={activeView}
        profile={profile}
        unreadCount={2}
        mobileOpen={mobileMenuOpen}
        onSelectView={setActiveView}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onRequestSignOut={() => setIsSignOutModalOpen(true)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 xl:pl-72">
        {/* Header Bar */}
        <Header
          activeView={activeView}
          profile={profile}
          unreadNotificationsCount={2}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onSelectView={setActiveView}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {activeView === "challenge" && <ChallengeBuilder profile={profile} />}
          {activeView === "history" && <HistoryView />}
          {activeView === "notifications" && <NotificationsView />}
          {activeView === "settings" && (
            <SettingsView profile={profile} onUpdateProfile={setProfile} />
          )}
        </main>
      </div>

      {/* 3. Accessible Sign Out Confirmation Pop-up */}
      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={onLogout}
        userHandle={profile.codeforcesHandle}
      />
    </div>
  );
}
