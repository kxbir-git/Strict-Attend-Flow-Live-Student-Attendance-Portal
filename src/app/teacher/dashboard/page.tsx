"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  CheckSquare,
  Clock,
  Calendar,
  ArrowRight,
  Radio,
  FileSpreadsheet,
  Loader2,
  DoorOpen,
} from "lucide-react";

export default function TeacherDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [openSession, setOpenSession] = useState<any | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [ttRes, sessRes] = await Promise.all([
          fetch("/api/timetable"),
          fetch("/api/sessions"),
        ]);

        const ttData = await ttRes.json();
        const sessData = await sessRes.json();

        if (ttData.success) {
          setTimetable(ttData.data || []);
        }

        if (sessData.success) {
          const allSessions = sessData.data || [];
          setRecentSessions(allSessions.slice(0, 5));
          const currentOpen = allSessions.find((s: any) => s.status === "OPEN");
          setOpenSession(currentOpen || null);
        }
      } catch (err) {
        console.error("Failed to load teacher dashboard data", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Compute today's dayOfWeek (1=Mon ... 6=Sat, 7=Sun)
  const today = new Date();
  const jsDay = today.getDay();
  const currentDayOfWeek = jsDay === 0 ? 7 : jsDay;
  const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const currentDayName = dayNames[currentDayOfWeek];

  const todaySlots = timetable.filter((s) => s.dayOfWeek === currentDayOfWeek);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        <span>Loading teacher dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome & Highlights */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50/80 to-white border border-indigo-100 rounded-3xl p-6 lg:p-8 shadow-xs">
        <div className="space-y-1.5">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-indigo-100/70 text-indigo-800 border border-indigo-200">
            {currentDayName} • {today.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
            Welcome back, {session?.user?.name || "Professor"}!
          </h1>
          <p className="text-slate-600 text-sm">
            {todaySlots.length > 0
              ? `You have ${todaySlots.length} lectures scheduled today. Attendance is locked immediately on submit.`
              : "No regular lectures scheduled for today. You can build your timetable or take an extra session."}
          </p>
        </div>

        <Link
          href="/teacher/take-attendance"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition hover:scale-[1.02]"
        >
          <CheckSquare className="w-5 h-5" /> Take Attendance Now
        </Link>
      </div>

      {/* Live Session Alert Banner (if any session is OPEN) */}
      {openSession && (
        <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 animate-pulse">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-900 text-sm">ACTIVE LIVE ATTENDANCE SESSION</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                  Code: {openSession.qrCode || "OPEN"}
                </span>
              </div>
              <div className="text-xs text-slate-600">
                {openSession.class?.name} • {openSession.subject?.name} • Period {openSession.periodNo} ({openSession.startTime} - {openSession.endTime})
              </div>
            </div>
          </div>

          <Link
            href={`/teacher/session/${openSession.id}`}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
          >
            Resume Live Grid <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Grid: Today's Schedule & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" /> Today&apos;s Lectures ({currentDayName})
            </h2>
            <Link
              href="/teacher/timetable"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Edit Weekly Timetable →
            </Link>
          </div>

          {todaySlots.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-xs">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-slate-600 text-sm">
                No slots configured for {currentDayName} in your timetable.
              </p>
              <Link
                href="/teacher/timetable"
                className="inline-block px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
              >
                Configure Timetable Slots
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {todaySlots.map((slot) => (
                <div
                  key={slot.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition flex flex-col justify-between space-y-4 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Period {slot.periodNo}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1.5">
                        {slot.subject?.name}
                      </h3>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        {slot.subject?.code} • {slot.class?.name}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">
                        <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                        {slot.room}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Standard slot
                    </span>
                    <Link
                      href={`/teacher/take-attendance?date=${today.toISOString().split("T")[0]}&period=${slot.periodNo}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      Start Attendance <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Recent Sessions (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" /> Recent Sessions
            </h2>
            <Link
              href="/teacher/history"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              View All →
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 divide-y divide-slate-100 shadow-xs">
            {recentSessions.length === 0 ? (
              <p className="text-slate-400 text-xs py-4 text-center">
                No past attendance sessions found.
              </p>
            ) : (
              recentSessions.map((sess) => (
                <div key={sess.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {sess.subject?.code} • {sess.class?.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {new Date(sess.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} • Period {sess.periodNo}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sess.status === "SUBMITTED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {sess.status}
                    </span>
                    <Link
                      href={`/teacher/session/${sess.id}`}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600"
                      title="View Session"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
