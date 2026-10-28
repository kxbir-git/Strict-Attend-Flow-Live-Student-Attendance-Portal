"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  Clock,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Lock,
} from "lucide-react";

import { Suspense } from "react";

function TakeAttendanceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const todayStr = new Date().toISOString().split("T")[0];
  const initialDate = searchParams.get("date") || todayStr;
  const initialPeriod = searchParams.get("period") ? parseInt(searchParams.get("period")!, 10) : 1;

  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(initialPeriod);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [existingSessions, setExistingSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [ttRes, pRes, sRes] = await Promise.all([
          fetch("/api/timetable"),
          fetch("/api/admin/periods"),
          fetch("/api/sessions"),
        ]);

        const [ttData, pData, sData] = await Promise.all([
          ttRes.json(),
          pRes.json(),
          sRes.json(),
        ]);

        if (ttData.success) setTimetable(ttData.data || []);
        if (pData.success) setPeriods(pData.data || []);
        if (sData.success) setExistingSessions(sData.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Compute weekday for selected date
  // 1 = Monday ... 6 = Saturday, 7 = Sunday
  const dateObj = new Date(selectedDate);
  const jsDay = dateObj.getDay();
  const dayOfWeek = jsDay === 0 ? 7 : jsDay;
  const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const currentDayName = dayNames[dayOfWeek] || "";

  // Check if date is in the future
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  const isFutureDate = dateObj > now;

  // Auto-detect TimetableSlot for (dayOfWeek, selectedPeriod)
  const detectedSlot = timetable.find(
    (s) => s.dayOfWeek === dayOfWeek && s.periodNo === selectedPeriod
  );

  // Period timing lookup
  const periodInfo = periods.find((p) => p.periodNo === selectedPeriod) || {
    startTime: "09:00",
    endTime: "09:45",
  };

  // Check if session already exists for this (classId, date, periodNo)
  const matchingExistingSession = detectedSlot
    ? existingSessions.find(
      (sess) =>
        sess.classId === detectedSlot.classId &&
        sess.periodNo === selectedPeriod &&
        sess.date.startsWith(selectedDate)
    )
    : null;

  const isAlreadySubmitted = matchingExistingSession?.status === "SUBMITTED";
  const isCurrentlyOpen = matchingExistingSession?.status === "OPEN";

  const handleStartAttendance = async () => {
    if (!detectedSlot) return;
    setError(null);
    setStarting(true);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: detectedSlot.subjectId,
          classId: detectedSlot.classId,
          date: selectedDate,
          periodNo: selectedPeriod,
          startTime: periodInfo.startTime,
          endTime: periodInfo.endTime,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to start attendance session");
        setStarting(false);
      } else {
        // Redirect to attendance grid for this session
        router.push(`/teacher/session/${data.data.id}`);
      }
    } catch (err: any) {
      setError(err.message || "Network error");
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        <span>Loading session picker...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      {/* Page Title */}
      <div className="text-center space-y-1">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
          Core Teacher Flow
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Date + Period Auto-Detection
        </h1>
        <p className="text-slate-500 text-sm">
          Select date and period. The portal automatically resolves your class, subject, and classroom from your manual timetable.
        </p>
      </div>

      {/* Picker Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Step 1: Select Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" /> Step 1: Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              max={todayStr}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setError(null);
              }}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none font-medium"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Weekday: <strong className="text-indigo-700">{currentDayName}</strong>
            </span>
          </div>

          {/* Step 2: Select Period */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" /> Step 2: Select Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => {
                setSelectedPeriod(parseInt(e.target.value, 10));
                setError(null);
              }}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none font-medium"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((pNum) => {
                const pSlot = timetable.find((s) => s.dayOfWeek === dayOfWeek && s.periodNo === pNum);
                return (
                  <option key={pNum} value={pNum}>
                    Period {pNum} {pSlot ? `— ${pSlot.subject?.code} (${pSlot.class?.name})` : "— (No timetable slot)"}
                  </option>
                );
              })}
            </select>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Slot Time: {periodInfo.startTime} - {periodInfo.endTime}
            </span>
          </div>
        </div>

        {/* Validation Errors & Warnings */}
        {isFutureDate && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>Future dates are strictly not allowed for taking attendance.</span>
          </div>
        )}

        {dayOfWeek === 7 && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
            <span>Sunday selected: Standard timetable slots do not apply on Sunday.</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 3: Auto-Detected Class & Subject Preview */}
        {detectedSlot ? (
          <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Auto-Detected Timetable Preview
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-indigo-100 shadow-xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Class</span>
                <span className="text-slate-900 font-extrabold text-sm">{detectedSlot.class?.name}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-indigo-100 shadow-xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Subject</span>
                <span className="text-slate-900 font-extrabold text-sm truncate block" title={detectedSlot.subject?.name}>
                  {detectedSlot.subject?.code}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-indigo-100 shadow-xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Room</span>
                <span className="text-slate-900 font-extrabold text-sm">{detectedSlot.room}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-indigo-100 shadow-xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Time Slot</span>
                <span className="text-slate-900 font-extrabold text-sm">
                  {periodInfo.startTime} - {periodInfo.endTime}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-600 font-mono pt-1">
              {detectedSlot.class?.name} | {detectedSlot.subject?.name} | Period {selectedPeriod} | {detectedSlot.room} | {periodInfo.startTime}–{periodInfo.endTime}
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
            <div className="font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Is period me class nahi hai, pehle timetable set karo
            </div>
            <p className="text-slate-600 text-[11px]">
              You don&apos;t have a scheduled lecture on {currentDayName} during Period {selectedPeriod}. Please assign this slot in your weekly timetable builder first.
            </p>
          </div>
        )}

        {/* Action Buttons based on state */}
        <div className="pt-2">
          {isAlreadySubmitted ? (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>
                  Attendance for this class, date and period has <strong>already been submitted and locked</strong>.
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  disabled
                  className="flex-1 py-3.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2 border border-slate-200"
                >
                  <Lock className="w-4 h-4" /> Already Submitted
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/teacher/session/${matchingExistingSession.id}`)}
                  className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
                >
                  View Locked Session <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : isCurrentlyOpen ? (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>An active open attendance session already exists for this slot.</span>
              </div>

              <button
                type="button"
                onClick={() => router.push(`/teacher/session/${matchingExistingSession.id}`)}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
              >
                Resume Open Session <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!detectedSlot || isFutureDate || starting}
              onClick={handleStartAttendance}
              className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm shadow-md shadow-indigo-600/20 transition hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              {starting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Launching Session...
                </>
              ) : (
                <>
                  <CheckSquare className="w-5 h-5" /> Start Attendance (Default All Absent)
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TakeAttendancePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-slate-500">Loading attendance picker...</div>}>
      <TakeAttendanceForm />
    </Suspense>
  );
}
