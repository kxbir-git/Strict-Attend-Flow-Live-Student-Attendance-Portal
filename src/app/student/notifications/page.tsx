"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, CheckCheck, ExternalLink, AlertTriangle, Radio, FileText } from "lucide-react";

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = () => {
    setLoading(true);
    fetch("/api/student/notifications")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setNotifications(res.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllAsRead = async () => {
    await fetch("/api/student/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markSingleAsRead = async (id: string) => {
    await fetch(`/api/student/notifications/${id}`, { method: "PATCH" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-emerald-600" />
            Notifications &amp; Reminders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Lecture start alerts, 75% attendance dips, and verified leave status updates.
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition shadow-xs"
        >
          <CheckCheck className="w-4 h-4 text-emerald-600" /> Mark all read
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm divide-y divide-slate-100">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No notifications at this time. You&apos;re all caught up!
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && markSingleAsRead(n.id)}
              className={`py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4 transition cursor-pointer ${!n.read ? "bg-emerald-50/40 -mx-4 px-4 rounded-xl" : ""
                }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border ${n.type === "LOW_ATTENDANCE"
                      ? "bg-rose-50 border-rose-200 text-rose-600"
                      : n.type === "LIVE_SESSION"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-600 animate-pulse"
                        : n.type === "LEAVE_STATUS"
                          ? "bg-amber-50 border-amber-200 text-amber-600"
                          : "bg-indigo-50 border-indigo-200 text-indigo-600"
                    }`}
                >
                  {n.type === "LOW_ATTENDANCE" && <AlertTriangle className="w-4 h-4" />}
                  {n.type === "LIVE_SESSION" && <Radio className="w-4 h-4" />}
                  {n.type === "LEAVE_STATUS" && <FileText className="w-4 h-4" />}
                  {n.type !== "LOW_ATTENDANCE" && n.type !== "LIVE_SESSION" && n.type !== "LEAVE_STATUS" && (
                    <Bell className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-xs sm:text-sm font-bold ${!n.read ? "text-slate-900" : "text-slate-600"
                        }`}
                    >
                      {n.title}
                    </h3>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 block pt-0.5">
                    {new Date(n.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>

              {n.actionUrl && (
                <Link
                  href={n.actionUrl}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
