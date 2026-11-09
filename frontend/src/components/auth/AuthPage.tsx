"use client";

import React, { FormEvent, useState } from "react";
import { AlertCircle, ArrowRight, Code2, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import { AuthMode, UserProfile } from "@/types";
import ThemeToggle from "../common/ThemeToggle";

interface AuthPageProps {
  initialMode?: AuthMode;
  onSuccess: (profile: UserProfile, requiresVerification: boolean) => void;
}

/**
 * AuthPage Component
 * Provides Sign In and Sign Up with granular per-field validation,
 * inline red error feedback directly below inputs, full Light/Dark mode,
 * and responsive ergonomics.
 */
export default function AuthPage({
  initialMode = "signin",
  onSuccess,
}: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Form states
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Field-specific error states (shown in RED below the box)
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [fullNameError, setFullNameError] = useState<string | null>(null);

  // Track whether form has been attempted
  const [wasSubmitted, setWasSubmitted] = useState(false);

  const isSignUp = mode === "signup";

  // Email validation rule
  function validateEmail(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) {
      return "Email address is required.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return "Please enter a valid email address (e.g. name@example.com).";
    }
    return null;
  }

  // Password validation rule (applies to both Sign In and Sign Up)
  function validatePassword(value: string): string | null {
    if (!value) {
      return "Password is required.";
    }
    if (value.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (isSignUp) {
      const hasLetter = /[a-zA-Z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      if (!hasLetter || !hasNumber) {
        return "Password must include at least one letter and one number.";
      }
    }
    return null;
  }

  // Username validation rule (Sign Up)
  function validateUsername(value: string): string | null {
    if (!isSignUp) return null;
    const trimmed = value.trim();
    if (!trimmed) {
      return "Username is required.";
    }
    if (trimmed.length < 3) {
      return "Username must be at least 3 characters.";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      return "Username can only contain letters, numbers, and underscores.";
    }
    return null;
  }

  // Full Name validation rule (Sign Up)
  function validateFullName(value: string): string | null {
    if (!isSignUp) return null;
    if (!value.trim()) {
      return "Full name is required.";
    }
    return null;
  }

  // Real-time onChange handler for Email
  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setEmail(val);
    if (wasSubmitted) {
      setEmailError(validateEmail(val));
    }
  }

  // Real-time onChange handler for Password
  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setPassword(val);
    if (wasSubmitted) {
      setPasswordError(validatePassword(val));
    }
  }

  // Form submission validation
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWasSubmitted(true);

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    const userErr = validateUsername(username);
    const nameErr = validateFullName(fullName);

    setEmailError(emailErr);
    setPasswordError(passErr);
    setUsernameError(userErr);
    setFullNameError(nameErr);

    // If any error exists, halt submission
    if (emailErr || passErr || userErr || nameErr) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const userProfile: UserProfile = {
        username: username.trim() || (isSignUp ? "alexmorgan" : "tourist_fan"),
        fullName: fullName.trim() || "Alex Morgan",
        email: email.trim(),
        codeforcesHandle: isSignUp ? "" : "tourist",
      };

      onSuccess(userProfile, isSignUp);
    }, 450);
  }

  function switchMode(newMode: AuthMode) {
    setMode(newMode);
    setEmailError(null);
    setPasswordError(null);
    setUsernameError(null);
    setFullNameError(null);
    setWasSubmitted(false);
  }

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-x-hidden bg-slate-50 dark:bg-[#0a0c10] transition-colors duration-200">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 dark:bg-indigo-600/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[15%] w-[550px] h-[550px] rounded-full bg-purple-500/10 dark:bg-purple-600/10 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.4] dark:opacity-[0.25]"
          style={{
            backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.08) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(circle at center, black, transparent 80%)",
          }}
        />
      </div>

      {/* Main Card */}
      <section className="relative z-10 w-full max-w-[480px] rounded-2xl border border-slate-200 bg-white/95 p-6 sm:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all duration-300 dark:border-white/[0.08] dark:bg-[#12151e]/95 dark:shadow-2xl dark:shadow-black/60">
        {/* Brand Header & Theme Toggle */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/25">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Lockout
              </span>
              <span className="ml-1.5 rounded bg-indigo-50 dark:bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                1v1 CP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium">Servers live</span>
            </div>
          </div>
        </header>

        {/* Title & Subtitle */}
        <div className="mb-6">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            {isSignUp ? "Create your account" : "Welcome back"}
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {isSignUp ? "Join the tournament." : "Sign in to Lockout."}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {isSignUp
              ? "Race 1v1 on Codeforces problems, lock out your opponent, and win."
              : "Compete, claim problems first, and climb the global leaderboard."}
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div
          role="tablist"
          className="grid grid-cols-2 rounded-xl bg-slate-100 dark:bg-[#0b0d14] p-1 border border-slate-200/80 dark:border-white/[0.04] mb-6"
          aria-label="Authentication Type"
        >
          <button
            type="button"
            role="tab"
            aria-selected={!isSignUp}
            onClick={() => switchMode("signin")}
            className={`cursor-pointer rounded-lg py-2 text-xs sm:text-sm font-semibold transition-all duration-150 ${
              !isSignUp
                ? "bg-white text-slate-900 shadow-sm dark:bg-[#1e2333] dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isSignUp}
            onClick={() => switchMode("signup")}
            className={`cursor-pointer rounded-lg py-2 text-xs sm:text-sm font-semibold transition-all duration-150 ${
              isSignUp
                ? "bg-white text-slate-900 shadow-sm dark:bg-[#1e2333] dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {isSignUp && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Username Input */}
              <div>
                <label
                  htmlFor="signup-username"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5"
                >
                  Username
                </label>
                <input
                  id="signup-username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (wasSubmitted) setUsernameError(validateUsername(e.target.value));
                  }}
                  onBlur={() => {
                    if (wasSubmitted) setUsernameError(validateUsername(username));
                  }}
                  placeholder="alexmorgan"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition focus:outline-none ${
                    usernameError
                      ? "border-rose-500 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:bg-rose-950/20 dark:text-rose-200"
                      : "border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-[#0b0d14] dark:text-white dark:placeholder-slate-600"
                  }`}
                />
                {usernameError && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-fade-in">
                    <AlertCircle className="h-3.5 w-3.5 flex-none" />
                    <span>{usernameError}</span>
                  </p>
                )}
              </div>

              {/* Full Name Input */}
              <div>
                <label
                  htmlFor="signup-fullname"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="signup-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (wasSubmitted) setFullNameError(validateFullName(e.target.value));
                  }}
                  onBlur={() => {
                    if (wasSubmitted) setFullNameError(validateFullName(fullName));
                  }}
                  placeholder="Alex Morgan"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition focus:outline-none ${
                    fullNameError
                      ? "border-rose-500 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:bg-rose-950/20 dark:text-rose-200"
                      : "border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-[#0b0d14] dark:text-white dark:placeholder-slate-600"
                  }`}
                />
                {fullNameError && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-fade-in">
                    <AlertCircle className="h-3.5 w-3.5 flex-none" />
                    <span>{fullNameError}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Email ID Input with below-the-box RED error message */}
          <div>
            <label
              htmlFor="auth-email"
              className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5"
            >
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => {
                if (wasSubmitted || email.length > 0) {
                  setEmailError(validateEmail(email));
                }
              }}
              placeholder="alex@example.com"
              autoComplete="email"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition focus:outline-none ${
                emailError
                  ? "border-rose-500 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:bg-rose-950/20 dark:text-rose-200"
                  : "border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-[#0b0d14] dark:text-white dark:placeholder-slate-600"
              }`}
            />
            {/* PROBLEM TOLD BELOW ENTERING BOX IN RED */}
            {emailError && (
              <p
                role="alert"
                className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-fade-in"
              >
                <AlertCircle className="h-3.5 w-3.5 flex-none" />
                <span>{emailError}</span>
              </p>
            )}
          </div>

          {/* Password Input with below-the-box RED error message */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="auth-password"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400"
              >
                Password
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition cursor-pointer"
                  onClick={() => alert("Password reset instructions will be sent to your email.")}
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => {
                  if (wasSubmitted || password.length > 0) {
                    setPasswordError(validatePassword(password));
                  }
                }}
                placeholder={isSignUp ? "At least 8 chars with 1 number" : "Enter your password"}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                className={`w-full rounded-xl border pl-3.5 pr-11 py-2.5 text-sm transition focus:outline-none ${
                  passwordError
                    ? "border-rose-500 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:bg-rose-950/20 dark:text-rose-200"
                    : "border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-[#0b0d14] dark:text-white dark:placeholder-slate-600"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {/* PROBLEM TOLD BELOW ENTERING BOX IN RED */}
            {passwordError && (
              <p
                role="alert"
                className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-fade-in"
              >
                <AlertCircle className="h-3.5 w-3.5 flex-none" />
                <span>{passwordError}</span>
              </p>
            )}
          </div>

          {!isSignUp && (
            <div className="flex items-center gap-2 pt-1">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer dark:border-slate-700 dark:bg-[#0b0d14]"
              />
              <label htmlFor="remember-me" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                Remember me for 30 days
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <>
                <span>{isSignUp ? "Create Lockout Account" : "Sign In to Play"}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="w-full border-t border-slate-200 dark:border-white/[0.08]" />
          <span className="absolute bg-white dark:bg-[#12151e] px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Or continue with
          </span>
        </div>

        {/* Social Login Button */}
        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            setTimeout(() => {
              setIsLoading(false);
              onSuccess(
                {
                  username: "google_competitor",
                  fullName: "Google Competitor",
                  email: "competitor@gmail.com",
                  codeforcesHandle: "tourist",
                },
                false
              );
            }, 300);
          }}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs sm:text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 dark:border-white/[0.08] dark:bg-[#181c28] dark:text-slate-200 dark:hover:bg-[#1f2434] active:scale-[0.99] cursor-pointer"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{isSignUp ? "Sign up with Google" : "Continue with Google"}</span>
        </button>

        {/* Footer Toggle */}
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          {isSignUp ? "Already have a Lockout account?" : "New to Lockout?"}{" "}
          <button
            type="button"
            onClick={() => switchMode(isSignUp ? "signin" : "signup")}
            className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2 transition cursor-pointer"
          >
            {isSignUp ? "Sign in instead" : "Create one free"}
          </button>
        </p>
      </section>

      {/* Security badge at bottom */}
      <footer className="absolute bottom-3 text-center text-[11px] text-slate-500 dark:text-slate-500 flex items-center justify-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
        <span>Official Codeforces Fair Play & Verification Enforced</span>
      </footer>
    </main>
  );
}
