"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Radio,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { queueOfflineAttendance, syncOfflineQueue } from "@/lib/offline-sync";

export default function StudentLivePage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [marking, setMarking] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function checkLiveStatus() {
    try {
      const res = await fetch("/api/student/attendance");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkLiveStatus();
    // Poll every 5s for live session status
    const interval = setInterval(checkLiveStatus, 5000);

    // Auto-sync offline queue on online
    const handleOnline = () => {
      syncOfflineQueue(() => {
        checkLiveStatus();
      });
    };
    window.addEventListener("online", handleOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.liveSession?.sessionId) return;

    setMarking(true);
    setResult(null);

    // If browser is offline, queue locally
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      queueOfflineAttendance({
        sessionId: data.liveSession.sessionId,
        code: code.trim(),
      });
      setResult({
        success: true,
        message: "You are offline. Attendance mark saved locally in offline queue and will auto-sync once connection restores!",
      });
      setMarking(false);
      return;
    }

    try {
      const res = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: data.liveSession.sessionId,
          code: code.trim(),
          deviceInfo: navigator.userAgent.slice(0, 100),
        }),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        setResult({
          success: false,
          message: resJson.error || "Failed to mark attendance. Verify passcode.",
        });
      } else {
        setResult({
          success: true,
          message: resJson.message || "Attendance marked successfully!",
        });
        checkLiveStatus();
      }
    } catch (err: any) {
      // Network failed during send, save to offline queue
      queueOfflineAttendance({
        sessionId: data.liveSession.sessionId,
        code: code.trim(),
      });
      setResult({
        success: true,
        message: "Network error encountered. Saved to offline queue; will automatically sync when online.",
      });
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
        <span>Scanning for live classroom sessions...</span>
      </div>
    );
  }

  const live = data?.liveSession;

  return (
    <div className="max-w-md mx-auto space-y-6 py-6 px-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
          Live Verification
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Self-Mark Attendance</h1>
        <p className="text-xs text-slate-500">
          Enter the 4-digit numeric code shown on the faculty screen or scan rotating QR
        </p>
      </div>

      {!live ? (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">No Live Session Active</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              There are currently no open attendance sessions for your class. When your faculty starts a session, this screen will activate automatically.
            </p>
          </div>
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            Back to Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : live.isMarkedPresent ? (
        <div className="p-8 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Attendance Verified!</h2>
            <p className="text-xs text-emerald-800 mt-1">
              You have been successfully recorded as <strong className="text-slate-900">PRESENT</strong> for {live.subjectName}.
            </p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs font-mono text-slate-600">
            Period {live.periodNo} ({live.startTime} - {live.endTime})
          </div>
          <Link
            href="/student/dashboard"
            className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm"
          >
            Return to Dashboard
          </Link>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-5 shadow-sm">
          {/* Active Session Details */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-emerald-700 font-bold">{live.subjectCode}</span>
              <span className="text-slate-500 font-mono">Period {live.periodNo}</span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{live.subjectName}</h3>
            <p className="text-xs text-slate-500">
              Instructor: <strong className="text-slate-700">{live.teacherName}</strong>
            </p>
          </div>

          {/* Result Alert */}
          {result && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${result.success
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border border-rose-200 text-rose-800"
                }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              )}
              <span>{result.message}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleMarkAttendance} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Enter 4-Digit In-Class Passcode:
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={4}
                  required
                  autoFocus
                  placeholder="0000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full tracking-[0.5em] text-center font-mono text-2xl font-black py-3 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white placeholder:text-slate-300"
                />
                <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={marking || code.length !== 4}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              {marking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Confirm &amp; Mark Present
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-400">
            Anti-Cheat: Code rotates every 30 seconds. Rate limited to 3 attempts/minute. Device fingerprint &amp; timestamp recorded.
          </p>
        </div>
      )}
    </div>
  );
}
