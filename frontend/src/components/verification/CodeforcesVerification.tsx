"use client";

import React, { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import CodeforcesLogo from "../common/CodeforcesLogo";
import ThemeToggle from "../common/ThemeToggle";
import { VerificationPhase } from "@/types";

interface CodeforcesVerificationProps {
  initialPhase?: VerificationPhase;
  defaultHandle?: string;
  onBack: () => void;
  onComplete: (handle: string) => void;
}

const PROBLEM_1A_URL = "https://codeforces.com/problemset/problem/1/A";

/**
 * CodeforcesVerification Component
 * Multi-stage verification allowing CP athletes to link their profile
 * with support for Light and Dark modes.
 */
export default function CodeforcesVerification({
  initialPhase = "handle",
  defaultHandle = "",
  onBack,
  onComplete,
}: CodeforcesVerificationProps) {
  const [phase, setPhase] = useState<VerificationPhase>(initialPhase);
  const [handle, setHandle] = useState(defaultHandle || "tourist");
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 minutes
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (phase !== "challenge" || secondsLeft <= 0) return;

    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [phase, secondsLeft]);

  function handleHandleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!handle.trim()) return;
    setSecondsLeft(300);
    setPhase("challenge");
  }

  function handleCheckSubmission() {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setPhase("success");
    }, 1500);
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  const isEnding = secondsLeft < 60;

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-50 transition-colors duration-200 dark:bg-[#0a0c10] overflow-x-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-5%] left-[25%] w-[450px] h-[450px] rounded-full bg-indigo-500/10 dark:bg-indigo-600/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] rounded-full bg-violet-500/10 dark:bg-violet-600/10 blur-[130px]" />
      </div>

      <section className="relative z-10 w-full max-w-[540px] rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-xl shadow-xl shadow-slate-200/50 transition-all duration-300 dark:border-white/[0.08] dark:bg-[#12151e]/95 dark:shadow-2xl dark:shadow-black/60">
        {/* Verification Card Header */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] px-6 py-4.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-black text-xs shadow-md shadow-indigo-600/30">
              &lt;/&gt;
            </div>
            <span className="font-extrabold uppercase tracking-wider text-slate-900 dark:text-white text-sm">
              Lockout Verification
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="rounded-full bg-slate-100 dark:bg-[#1b202e] px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.05]">
              {phase === "handle" ? "Step 1 of 2" : phase === "success" ? "Completed" : "Step 2 of 2"}
            </span>
          </div>
        </header>

        {/* Verification Content Body */}
        <div className="p-6 sm:p-8">
          {/* STAGE 1: Handle Input */}
          {phase === "handle" && (
            <div className="animate-fade-in text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/[0.08] dark:bg-[#191d2a] shadow-inner">
                <CodeforcesLogo size="lg" />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Identity Linking
              </span>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Connect Codeforces
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Connect your competitive programming profile so Lockout can verify your rating and automatically register your 1v1 match submissions.
              </p>

              <form onSubmit={handleHandleSubmit} className="mt-6 text-left">
                <label
                  htmlFor="cf-handle-input"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5"
                >
                  Codeforces Handle
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-mono text-sm">
                    @
                  </span>
                  <input
                    id="cf-handle-input"
                    type="text"
                    required
                    minLength={2}
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.replace(/^@+/, "").trim())}
                    placeholder="tourist"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-8 pr-4 py-3 text-sm text-slate-900 font-mono placeholder-slate-400 transition focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-[#0b0d14] dark:text-white dark:placeholder-slate-600"
                  />
                </div>

                {/* Popular Handles Chips */}
                <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-500">Suggested:</span>
                  {["tourist", "Benq", "Petr", "ecnerwala"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setHandle(preset)}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-indigo-700 hover:bg-indigo-50 transition cursor-pointer dark:bg-[#191d2a] dark:text-indigo-300 dark:hover:bg-indigo-600/20"
                    >
                      @{preset}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 cursor-pointer"
                >
                  <span>Continue to Verification</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </form>

              <button
                type="button"
                onClick={onBack}
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to sign up</span>
              </button>
            </div>
          )}

          {/* STAGE 2: Problem Submission Challenge */}
          {(phase === "challenge" || phase === "checking") && (
            <div className="animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    Proof of Ownership
                  </span>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    Prove <span className="text-indigo-600 dark:text-indigo-400 font-mono">@{handle}</span> is yours
                  </h1>
                </div>

                <div
                  className={`inline-flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-full border text-xs font-mono font-bold ${
                    isEnding
                      ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400"
                      : "bg-slate-100 border-slate-200 text-slate-700 dark:bg-[#181c28] dark:border-white/[0.08] dark:text-slate-300"
                  }`}
                >
                  <Clock
                    className={`h-3.5 w-3.5 ${isEnding ? "text-rose-600 animate-pulse" : "text-emerald-500"}`}
                  />
                  <span>
                    {minutes}:{seconds}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs sm:text-sm text-slate-700 leading-relaxed dark:border-white/[0.08] dark:bg-[#161a25] dark:text-slate-300">
                <div className="flex gap-2.5">
                  <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-none mt-0.5" />
                  <p>
                    Submit <strong>any code that produces a Compilation Error</strong> to the Codeforces problem below within the timer window. Then return here and click <strong>&quot;Verify Submission&quot;</strong>.
                  </p>
                </div>
              </div>

              <a
                href={PROBLEM_1A_URL}
                target="_blank"
                rel="noreferrer"
                className="group mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-indigo-400 hover:bg-slate-50 dark:border-white/[0.08] dark:bg-[#0b0d14] dark:hover:border-indigo-500/40 dark:hover:bg-[#10131d]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 flex-none dark:bg-[#181d2c] dark:border-white/[0.06]">
                    <CodeforcesLogo size="md" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Target Codeforces Problem
                    </span>
                    <strong className="block text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition dark:text-white dark:group-hover:text-indigo-300">
                      1A — Theatre Square
                    </strong>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Difficulty: 1000 · Math</span>
                  </div>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition dark:bg-[#1c2130] dark:text-indigo-400">
                  <ExternalLink className="h-4 w-4" />
                </div>
              </a>

              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={handleCheckSubmission}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 disabled:opacity-70 cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Checking Codeforces API...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>I&apos;ve Submitted — Verify Now</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={() => setPhase("handle")}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer dark:border-white/[0.08] dark:bg-[#181c28] dark:text-slate-300 dark:hover:bg-[#202535] dark:hover:text-white"
                >
                  Change Handle
                </button>
              </div>

              <p className="mt-4 text-center text-[11px] text-slate-500">
                Lockout verifies the latest public submission timestamp under @{handle}.
              </p>
            </div>
          )}

          {/* STAGE 3: Success Confirmation */}
          {phase === "success" && (
            <div className="animate-scale-up text-center py-3">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-sm dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Verification Successful
              </span>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                You&apos;re All Set!
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                <strong className="text-slate-900 dark:text-white font-mono">@{handle}</strong> is officially verified and linked to your Lockout account.
              </p>

              <button
                type="button"
                onClick={() => onComplete(handle)}
                className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 cursor-pointer"
              >
                <span>Enter Lockout Arena</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
