"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AuthPage from "@/components/auth/AuthPage";
import CodeforcesVerification from "@/components/verification/CodeforcesVerification";
import Dashboard from "@/components/dashboard/Dashboard";
import { AuthMode, DashboardView, UserProfile } from "@/types";

/**
 * LockoutAppController
 * Manages the high-level authentication, verification, and dashboard flow
 * with support for URL query params (e.g. ?screen=dashboard or ?view=history).
 */
function LockoutAppController() {
  const searchParams = useSearchParams();
  const screenParam = searchParams.get("screen");
  const viewParam = searchParams.get("view");
  const phaseParam = searchParams.get("phase");

  type ScreenState = "auth" | "verification" | "dashboard";

  const initialScreen: ScreenState =
    screenParam === "dashboard"
      ? "dashboard"
      : screenParam === "verification"
        ? "verification"
        : "auth";

  const initialView: DashboardView =
    viewParam === "history" || viewParam === "notifications" || viewParam === "settings"
      ? viewParam
      : "challenge";

  const [screen, setScreen] = useState<ScreenState>(initialScreen);
  const [profile, setProfile] = useState<UserProfile>({
    username: "alexmorgan",
    fullName: "Alex Morgan",
    email: "alex@example.com",
    codeforcesHandle: "tourist",
  });

  // Handle successful login or account creation
  function handleAuthSuccess(user: UserProfile, requiresVerification: boolean) {
    setProfile(user);
    if (requiresVerification) {
      setScreen("verification");
    } else {
      setScreen("dashboard");
    }
  }

  // Handle successful Codeforces verification
  function handleVerificationComplete(handle: string) {
    setProfile((prev) => ({ ...prev, codeforcesHandle: handle }));
    setScreen("dashboard");
  }

  // Handle logout
  function handleLogout() {
    setScreen("auth");
  }

  if (screen === "verification") {
    return (
      <CodeforcesVerification
        defaultHandle={profile.codeforcesHandle}
        initialPhase={phaseParam === "challenge" || phaseParam === "success" ? phaseParam : "handle"}
        onBack={() => setScreen("auth")}
        onComplete={handleVerificationComplete}
      />
    );
  }

  if (screen === "dashboard") {
    return (
      <Dashboard
        initialProfile={profile}
        initialView={initialView}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <AuthPage
      initialMode={screenParam === "signup" ? "signup" : "signin"}
      onSuccess={handleAuthSuccess}
    />
  );
}

/**
 * Root Page with Suspense Boundary for searchParams client navigation
 */
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0c10]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
            <span className="text-xs font-mono text-slate-400">Loading Lockout...</span>
          </div>
        </div>
      }
    >
      <LockoutAppController />
    </Suspense>
  );
}

