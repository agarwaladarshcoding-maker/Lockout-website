"use client";

import React, { useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  Swords,
  TrendingUp,
} from "lucide-react";
import { NotificationItem } from "@/types";

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "1v1 Duel Invite from @tourist",
    description: "5 problems starting at 1400 rating · 45 min · Sudden Death",
    time: "2m ago",
    unread: true,
    type: "challenge",
  },
  {
    id: "notif-2",
    title: "Codeforces Account Verified",
    description: "Handle @tourist has been verified. You can now join ranked arenas.",
    time: "1h ago",
    unread: true,
    type: "verified",
  },
  {
    id: "notif-3",
    title: "Rating Updated (+24)",
    description: "Victory registered against @Benq. New rating: 1684 (Expert).",
    time: "1d ago",
    unread: false,
    type: "rating",
  },
  {
    id: "notif-4",
    title: "System Maintenance Notice",
    description: "Codeforces API crawler updated with faster submission polling.",
    time: "3d ago",
    unread: false,
    type: "system",
  },
];

/**
 * NotificationsView Component
 * Displays duel challenges, verification alerts, and rating adjustments
 * in both Light and Dark mode with unread markers and interactive buttons.
 */
export default function NotificationsView() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  function handleAcceptChallenge(id: string) {
    alert("Match challenge accepted! Redirecting to live tournament lobby...");
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  function handleDeclineChallenge(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="max-w-3xl space-y-4">
      {/* Header card with action */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#12151e] dark:shadow-xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Inbox Activity
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {unreadCount > 0 ? `${unreadCount} Unread Notifications` : "All Caught Up"}
          </h2>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer dark:border-white/[0.08] dark:bg-[#181c28] dark:text-slate-300 dark:hover:bg-[#202535] dark:hover:text-white"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 shadow-sm dark:border-white/[0.08] dark:bg-[#12151e] dark:divide-white/[0.05] dark:shadow-xl overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No notifications available.
          </div>
        ) : (
          notifications.map((item) => {
            const isChallenge = item.type === "challenge";

            return (
              <article
                key={item.id}
                className={`relative p-5 transition-colors duration-150 ${
                  item.unread
                    ? "bg-indigo-50/50 dark:bg-indigo-600/[0.04]"
                    : "hover:bg-slate-50/60 dark:hover:bg-white/[0.01]"
                }`}
              >
                {/* Visual unread pill on left */}
                {item.unread && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.6)]"
                    aria-hidden="true"
                  />
                )}

                <div className="flex items-start gap-4">
                  {/* Icon badge */}
                  <div
                    className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl border ${
                      item.type === "challenge"
                        ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-600/15 dark:border-indigo-500/30 dark:text-indigo-400"
                        : item.type === "verified"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-400"
                          : item.type === "rating"
                            ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-400"
                            : "bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-white/[0.08] dark:text-slate-400"
                    }`}
                  >
                    {item.type === "challenge" ? (
                      <Swords className="h-4.5 w-4.5" />
                    ) : item.type === "verified" ? (
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    ) : item.type === "rating" ? (
                      <TrendingUp className="h-4.5 w-4.5" />
                    ) : (
                      <Bell className="h-4.5 w-4.5" />
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-200">
                        {item.title}
                      </strong>
                      <span className="font-mono text-[11px] text-slate-400 flex-none">
                        {item.time}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Challenge Action Buttons */}
                    {isChallenge && (
                      <div className="mt-3 flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleAcceptChallenge(item.id)}
                          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Accept Match</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeclineChallenge(item.id)}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition cursor-pointer dark:border-white/[0.08] dark:bg-[#181c28] dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
