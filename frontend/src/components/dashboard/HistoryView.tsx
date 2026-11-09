"use client";

import React, { useState } from "react";
import { Download, History, Search, TrendingUp, Trophy } from "lucide-react";
import { MatchHistoryItem } from "@/types";
import CodeforcesLogo from "../common/CodeforcesLogo";

const INITIAL_MATCHES: MatchHistoryItem[] = [
  {
    id: "m-101",
    opponent: "tourist",
    format: "5 problems · Base 1400",
    result: "Won",
    ratingChange: "+24",
    date: "Today, 14:30",
  },
  {
    id: "m-102",
    opponent: "Benq",
    format: "4 problems · Base 1500",
    result: "Lost",
    ratingChange: "−12",
    date: "Yesterday, 20:10",
  },
  {
    id: "m-103",
    opponent: "Petr",
    format: "6 problems · Base 1600",
    result: "Draw",
    ratingChange: "0",
    date: "Oct 28, 18:45",
  },
  {
    id: "m-104",
    opponent: "ecnerwala",
    format: "5 problems · Base 1300",
    result: "Won",
    ratingChange: "+19",
    date: "Oct 25, 21:15",
  },
  {
    id: "m-105",
    opponent: "Um_nik",
    format: "5 problems · Base 1700",
    result: "Lost",
    ratingChange: "−15",
    date: "Oct 20, 16:00",
  },
];

/**
 * HistoryView Component
 * Displays competitor match records with responsive desktop table and
 * mobile card layout, rating indicators, and CSV export in both Light and Dark mode.
 */
export default function HistoryView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [matches] = useState<MatchHistoryItem[]>(INITIAL_MATCHES);

  const filtered = matches.filter(
    (m) =>
      m.opponent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.format.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function exportCSV() {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Opponent,Format,Result,Rating Change,Date"]
        .concat(matches.map((m) => `${m.opponent},"${m.format}",${m.result},${m.ratingChange},"${m.date}"`))
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "lockout_match_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#12151e]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Total Matches
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-slate-900 dark:text-white">48</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">duels</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#12151e]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Win Rate
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">62.5%</span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400/80 font-medium">+4.2%</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#12151e]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Rating Peak
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-indigo-600 dark:text-indigo-400">1842</span>
            <span className="text-xs text-indigo-700 dark:text-indigo-400/80 font-medium">Expert</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#12151e]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Current Streak
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-amber-500 dark:text-amber-400">3W</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">in a row</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#12151e] dark:shadow-xl overflow-hidden">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/[0.06] p-4 sm:p-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by opponent or rating..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 transition focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-[#0b0d14] dark:text-white dark:placeholder-slate-600"
            />
          </div>

          <button
            type="button"
            onClick={exportCSV}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer dark:border-white/[0.08] dark:bg-[#181c28] dark:text-slate-300 dark:hover:bg-[#202535] dark:hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* 1. Desktop & Tablet Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-white/[0.06] dark:bg-[#161a25]/60 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 whitespace-nowrap">Opponent</th>
                <th className="px-5 py-3">Format</th>
                <th className="px-5 py-3 whitespace-nowrap">Result</th>
                <th className="px-5 py-3 whitespace-nowrap">Rating Change</th>
                <th className="px-5 py-3 whitespace-nowrap">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {filtered.map((item) => {
                const isWon = item.result === "Won";
                const isLost = item.result === "Lost";

                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-[#161a25]/40 transition">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-mono font-semibold text-slate-900 dark:text-white">
                        <CodeforcesLogo size="sm" />
                        <span>@{item.opponent}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                      {item.format}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          isWon
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : isLost
                              ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                              : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20"
                        }`}
                      >
                        {item.result}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-mono font-bold whitespace-nowrap">
                      <span
                        className={
                          item.ratingChange.startsWith("+")
                            ? "text-emerald-600 dark:text-emerald-400"
                            : item.ratingChange.startsWith("−")
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-slate-500 dark:text-slate-400"
                        }
                      >
                        {item.ratingChange}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-slate-500 font-mono whitespace-nowrap">
                      {item.date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 2. Mobile Responsive Card List */}
        <div className="block sm:hidden divide-y divide-slate-100 dark:divide-white/[0.05]">
          {filtered.map((item) => {
            const isWon = item.result === "Won";
            const isLost = item.result === "Lost";

            return (
              <div key={item.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono font-semibold text-slate-900 dark:text-white text-sm">
                    <CodeforcesLogo size="sm" />
                    <span>@{item.opponent}</span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      isWon
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                        : isLost
                          ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                          : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20"
                    }`}
                  >
                    {item.result}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {item.format}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-mono text-slate-500">{item.date}</span>
                  <span
                    className={`font-mono font-bold ${
                      item.ratingChange.startsWith("+")
                        ? "text-emerald-600 dark:text-emerald-400"
                        : item.ratingChange.startsWith("−")
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {item.ratingChange} rating
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
