import React from "react";

interface CodeforcesLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * CodeforcesLogo
 * Renders the iconic Codeforces 3-bar logo (Yellow, Blue, Red).
 * Fully responsive and accessible.
 */
export default function CodeforcesLogo({
  className = "",
  size = "md",
}: CodeforcesLogoProps) {
  const heights = {
    sm: { y: "h-3.5", b: "h-5", r: "h-3.5", w: "w-1" },
    md: { y: "h-4", b: "h-6", r: "h-4", w: "w-1.5" },
    lg: { y: "h-5", b: "h-8", r: "h-5", w: "w-2" },
  };

  const current = heights[size];

  return (
    <span
      className={`inline-flex items-end gap-0.5 select-none ${className}`}
      aria-label="Codeforces"
      role="img"
    >
      <span
        className={`${current.w} ${current.y} rounded-t-[2px] bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.4)]`}
      />
      <span
        className={`${current.w} ${current.b} rounded-t-[2px] bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.4)]`}
      />
      <span
        className={`${current.w} ${current.r} rounded-t-[2px] bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.4)]`}
      />
    </span>
  );
}

