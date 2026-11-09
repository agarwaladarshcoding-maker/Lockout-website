"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * ThemeToggle Component
 * Allows users to switch smoothly between Light and Dark mode.
 * Accessible with proper title and aria-label.
 */
export default function ThemeToggle({
  className = "",
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`group flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/[0.08] dark:bg-[#161a25] dark:text-slate-300 dark:hover:bg-[#1e2333] dark:hover:text-white cursor-pointer active:scale-95 ${className}`}
    >
      <div className="relative flex h-5 w-5 items-center justify-center">
        {isDark ? (
          <Sun className="h-4.5 w-4.5 text-amber-400 transition-transform duration-200 group-hover:rotate-45" />
        ) : (
          <Moon className="h-4.5 w-4.5 text-indigo-600 transition-transform duration-200 group-hover:-rotate-12" />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-semibold">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}

