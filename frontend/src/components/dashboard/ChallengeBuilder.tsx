"use client";

import React, { FormEvent, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Clock,
  Info,
  Swords,
  User,
} from "lucide-react";
import { TiebreakerMode, UserProfile } from "@/types";

interface ChallengeBuilderProps {
  profile: UserProfile;
}

const RATING_CHOICES = [800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1800, 2000];
const DURATION_PRESETS = [15, 30, 45, 60];
const QUICK_USERS = ["alexmorgan", "tourist_fan", "benq_racer", "coder_101"];

/**
 * ChallengeBuilder Component
 * Streamlined 1v1 challenge configuration allowing challenges exclusively by Lockout username.
 * Includes bounds checking, self-challenge prevention, and full Light/Dark mode polish.
 */
export default function ChallengeBuilder({ profile }: ChallengeBuilderProps) {
  const [opponent, setOpponent] = useState("");
  const [opponentError, setOpponentError] = useState<string | null>(null);
  const [rating, setRating] = useState(1200);
  const [questions, setQuestions] = useState(5);
  const [duration, setDuration] = useState(45);
  const [tiebreaker, setTiebreaker] = useState<TiebreakerMode>("draw");
  const [tieQuestions, setTieQuestions] = useState(1);
  const [tieRating, setTieRating] = useState(1400);
  const [tieTime, setTieTime] = useState(10);
  const [created, setCreated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate opponent username
  function validateOpponent(val: string): string | null {
    const clean = val.replace(/^@+/, "").trim();
    if (!clean) {
      return "Opponent username is required.";
    }
    if (clean.length < 3) {
      return "Username must be at least 3 characters.";
    }
    if (clean.toLowerCase() === profile.username.toLowerCase()) {
      return "You cannot challenge your own account.";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
      return "Username can only contain letters, numbers, and underscores.";
    }
    return null;
  }

  function handleOpponentChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Automatically strip leading @ symbol if user enters it
    const clean = e.target.value.replace(/^@+/, "");
    setOpponent(clean);
    if (opponentError) {
      setOpponentError(validateOpponent(clean));
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const err = validateOpponent(opponent);
    if (err) {
      setOpponentError(err);
      return;
    }
    setOpponentError(null);

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setCreated(true);
      setTimeout(() => setCreated(false), 3500);
    }, 400);
  }

  const safeQuestions = Math.max(1, Math.min(10, questions || 1));
  const problemList = Array.from({ length: Math.min(safeQuestions, 5) }).map((_, index) => {
    const problemRating = rating + index * 100;
    const problemPoints = (index + 1) * 100;
    return { index: index + 1, rating: problemRating, points: problemPoints };
  });

  const formattedHours = String(Math.floor(duration / 60)).padStart(2, "0");
  const formattedMinutes = String(duration % 60).padStart(2, "0");

  const ratingRangeText =
    safeQuestions > 1
      ? `${rating} – ${rating + (safeQuestions - 1) * 100}`
      : `${rating}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-6 items-start">
      {/* LEFT: Challenge Configuration Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors duration-200 dark:border-white/[0.08] dark:bg-[#12151e]/95 dark:shadow-xl overflow-hidden"
      >
        {/* Form Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 p-5 sm:p-6 bg-slate-50/70 dark:border-white/[0.06] dark:bg-[#161a25]/60">
          <div>
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              <Swords className="h-3.5 w-3.5" />
              <span>Head-to-head arena</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
              Create 1v1 Challenge
            </h2>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs text-emerald-700 font-medium dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ready for match</span>
          </div>
        </div>

        {/* SECTION 01: Opponent Selection (BY USERNAME ONLY) */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-start gap-3.5">
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-indigo-50 text-xs font-mono font-bold text-indigo-600 border border-indigo-200 dark:bg-indigo-600/15 dark:text-indigo-400 dark:border-indigo-500/20">
              01
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Choose your opponent
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Challenge any player directly by their <strong>Lockout username</strong>.
              </p>

              {/* Single Clean Input with @ adornment */}
              <div className="mt-4">
                <label
                  htmlFor="opponent-username"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5"
                >
                  Opponent Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-mono text-sm pointer-events-none">
                    @
                  </span>
                  <input
                    id="opponent-username"
                    type="text"
                    required
                    value={opponent}
                    onChange={handleOpponentChange}
                    onBlur={() => {
                      if (opponent.trim()) setOpponentError(validateOpponent(opponent));
                    }}
                    placeholder="e.g. tourist_fan"
                    autoComplete="off"
                    className={`w-full rounded-xl border pl-8 pr-4 py-2.5 text-xs sm:text-sm font-mono text-slate-900 transition focus:outline-none ${
                      opponentError
                        ? "border-rose-500 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:bg-rose-950/20 dark:text-rose-200"
                        : "border-slate-300 bg-slate-50/50 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-[#0b0d14] dark:text-white dark:placeholder-slate-600"
                    }`}
                  />
                </div>

                {/* Inline Red Problem Description */}
                {opponentError && (
                  <p
                    role="alert"
                    className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-fade-in"
                  >
                    <AlertCircle className="h-3.5 w-3.5 flex-none" />
                    <span>{opponentError}</span>
                  </p>
                )}
              </div>

              {/* Quick suggestions */}
              <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-500">Quick rivals:</span>
                {QUICK_USERS.map((handle) => (
                  <button
                    key={handle}
                    type="button"
                    onClick={() => {
                      setOpponent(handle);
                      setOpponentError(null);
                    }}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-indigo-700 hover:bg-indigo-50 transition cursor-pointer dark:bg-[#181c28] dark:text-indigo-300 dark:hover:bg-indigo-600/25"
                  >
                    @{handle}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 02: Problem Set */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-start gap-3.5">
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-indigo-50 text-xs font-mono font-bold text-indigo-600 border border-indigo-200 dark:bg-indigo-600/15 dark:text-indigo-400 dark:border-indigo-500/20">
              02
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Problem Set & Difficulty
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Define the starting rating and question count. Each problem increases by +100 rating.
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="rating-select" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                    Starting Rating (R)
                  </label>
                  <select
                    id="rating-select"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-mono transition focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer dark:border-white/[0.08] dark:bg-[#0b0d14] dark:text-white"
                  >
                    {RATING_CHOICES.map((val) => (
                      <option key={val} value={val}>
                        {val} {val >= 1600 ? "(Expert)" : val >= 1200 ? "(Pupil / Specialist)" : "(Newbie)"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="questions-count" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                    Number of Problems (1 - 10)
                  </label>
                  <input
                    id="questions-count"
                    type="number"
                    min={1}
                    max={10}
                    value={questions}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setQuestions(isNaN(val) ? 1 : Math.max(1, Math.min(10, val)));
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-mono transition focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-[#0b0d14] dark:text-white"
                  />
                </div>
              </div>

              {/* Problem list preview pills */}
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-white/[0.05] dark:bg-[#0b0d14]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Generated Problem Board Preview
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {problemList.map((p) => (
                    <div
                      key={p.index}
                      className="rounded-lg bg-white border border-slate-200 p-2 text-center shadow-xs dark:bg-[#161a25] dark:border-white/[0.05]"
                    >
                      <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                        P{p.index} · {p.points}pts
                      </span>
                      <strong className="block text-xs font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                        {p.rating}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 03: Challenge Timer */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-start gap-3.5">
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-indigo-50 text-xs font-mono font-bold text-indigo-600 border border-indigo-200 dark:bg-indigo-600/15 dark:text-indigo-400 dark:border-indigo-500/20">
              03
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Match Length
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Match duration from 5 to 180 minutes. Default is 45 minutes.
                  </p>
                </div>
                <span className="font-mono text-lg font-black text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl dark:text-indigo-400 dark:bg-indigo-600/10 dark:border-indigo-500/20">
                  {duration}m
                </span>
              </div>

              <div className="mt-5">
                <input
                  type="range"
                  min={5}
                  max={180}
                  step={5}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full custom-range"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-2">
                  <span>5 min</span>
                  <span>45 min</span>
                  <span>90 min</span>
                  <span>180 min</span>
                </div>
              </div>

              {/* Preset buttons */}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-slate-500">Presets:</span>
                {DURATION_PRESETS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDuration(m)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-mono font-medium transition cursor-pointer ${
                      duration === m
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#181c28] dark:text-slate-400 dark:hover:bg-[#202535] dark:hover:text-white"
                    }`}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 04: Tiebreaker */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-start gap-3.5">
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-indigo-50 text-xs font-mono font-bold text-indigo-600 border border-indigo-200 dark:bg-indigo-600/15 dark:text-indigo-400 dark:border-indigo-500/20">
              04
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Tiebreaker Policy
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Determine the outcome if both competitors achieve identical scores when time expires.
              </p>

              <div className="mt-4 grid grid-cols-2 rounded-xl bg-slate-100 p-1 border border-slate-200 dark:bg-[#0b0d14] dark:border-white/[0.05]">
                <button
                  type="button"
                  onClick={() => setTiebreaker("draw")}
                  className={`rounded-lg py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    tiebreaker === "draw"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-[#1e2333] dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Count as Draw
                </button>
                <button
                  type="button"
                  onClick={() => setTiebreaker("questions")}
                  className={`rounded-lg py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    tiebreaker === "questions"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-[#1e2333] dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Sudden Death Extra
                </button>
              </div>

              {tiebreaker === "questions" && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
                  <div>
                    <label htmlFor="tie-questions" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1">
                      Problems (1-3)
                    </label>
                    <input
                      id="tie-questions"
                      type="number"
                      min={1}
                      max={3}
                      value={tieQuestions}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setTieQuestions(isNaN(val) ? 1 : Math.max(1, Math.min(3, val)));
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 font-mono dark:border-white/[0.08] dark:bg-[#0b0d14] dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="tie-rating" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1">
                      Rating Start
                    </label>
                    <select
                      id="tie-rating"
                      value={tieRating}
                      onChange={(e) => setTieRating(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 font-mono dark:border-white/[0.08] dark:bg-[#0b0d14] dark:text-white"
                    >
                      {[1200, 1400, 1600, 1800, 2000].map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="tie-time" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1">
                      Extra Time
                    </label>
                    <div className="relative">
                      <input
                        id="tie-time"
                        type="number"
                        min={5}
                        max={30}
                        value={tieTime}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setTieTime(isNaN(val) ? 5 : Math.max(5, Math.min(30, val)));
                        }}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 font-mono pr-10 dark:border-white/[0.08] dark:bg-[#0b0d14] dark:text-white"
                      />
                      <span className="absolute inset-y-0 right-3 flex items-center text-[11px] text-slate-500 font-mono">
                        min
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-[#161a25]/50 flex items-center justify-between flex-wrap gap-4">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            <span>Challenger: </span>
            <strong className="text-slate-900 dark:text-white font-mono">@{profile.username}</strong>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 px-6 text-sm font-semibold text-white shadow-lg transition-all duration-200 cursor-pointer ${
              created
                ? "bg-emerald-600 shadow-emerald-600/20"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 active:scale-95"
            }`}
          >
            {created ? (
              <>
                <Check className="h-4 w-4" />
                <span>Challenge Dispatched ✓</span>
              </>
            ) : isSubmitting ? (
              <>
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Launching...</span>
              </>
            ) : (
              <>
                <span>Launch Challenge</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* RIGHT: Live Summary & Round Preview */}
      <aside className="space-y-4 lg:sticky lg:top-24">
        {/* Round Preview Card */}
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50 via-white to-white p-5 shadow-sm dark:border-indigo-500/20 dark:bg-gradient-to-b dark:from-indigo-950/30 dark:via-[#131622] dark:to-[#131622]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              <span>Round Duration Preview</span>
            </span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="mt-3 font-mono text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {formattedHours}:{formattedMinutes}:00
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Total match clock · Rapid countdown
          </p>

          <div className="mt-4 h-2 w-full rounded-full bg-slate-200 dark:bg-[#1b202e] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
              style={{ width: `${Math.max(10, (duration / 180) * 100)}%` }}
            />
          </div>
        </div>

        {/* Challenge Summary Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#12151e]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-3">
            Summary Details
          </span>

          <dl className="divide-y divide-slate-100 dark:divide-white/[0.05] text-xs">
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-slate-500 dark:text-slate-400">Challenger</dt>
              <dd className="font-mono font-semibold text-slate-900 dark:text-slate-200">
                @{profile.username}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-slate-500 dark:text-slate-400">Opponent</dt>
              <dd className="font-mono font-semibold text-slate-900 dark:text-slate-200 truncate max-w-[150px]">
                {opponent ? `@${opponent}` : "No opponent chosen"}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-slate-500 dark:text-slate-400">Total Problems</dt>
              <dd className="font-semibold text-slate-900 dark:text-white">{safeQuestions} Problems</dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-slate-500 dark:text-slate-400">Rating Range</dt>
              <dd className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                {ratingRangeText}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-slate-500 dark:text-slate-400">Tiebreaker</dt>
              <dd className="font-semibold text-slate-700 dark:text-slate-300">
                {tiebreaker === "draw" ? "Draw Allowed" : `+${tieQuestions} Prob (${tieTime}m)`}
              </dd>
            </div>
          </dl>
        </div>

        {/* Lockout Rules Tip Box */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 flex items-start gap-3 dark:border-white/[0.06] dark:bg-[#161a25]/70 dark:text-slate-400">
          <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-none mt-0.5" />
          <p className="leading-relaxed">
            <strong>Lockout Rule:</strong> The first competitor to receive an Accepted (AC) verdict on Codeforces claims that problem and locks the opponent out completely.
          </p>
        </div>
      </aside>
    </div>
  );
}
