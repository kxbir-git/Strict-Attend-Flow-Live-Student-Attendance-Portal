"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Lock,
  Clock,
  QrCode,
  Download,
  Copy,
  Mail,
  Share2,
  Loader2,
  Check,
  Radio,
} from "lucide-react";

export default function TeacherSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<any | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  // Rotating QR & Code
  const [qrCode, setQrCode] = useState<string>("");
  const [, setQrToken] = useState<string>("");
  const [qrExpiresIn, setQrExpiresIn] = useState<number>(30);
  const [showQrModal, setShowQrModal] = useState(false);

  // Load session data
  async function fetchSession() {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSession(data.data);
        setRecords(data.data.records || []);
      }
    } catch (err) {
      console.error("Failed to load session", err);
    } finally {
      setLoading(false);
    }
  }

  // Refresh QR token every 30s when OPEN
  async function fetchQrToken() {
    if (session?.status !== "OPEN") return;
    try {
      const res = await fetch(`/api/attendance/qr-token?sessionId=${sessionId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setQrToken(data.data.token);
        setQrCode(data.data.code);
        setQrExpiresIn(data.data.expiresInSeconds);
      }
    } catch (err) {
      console.error("Failed to fetch QR token", err);
    }
  }

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    if (session?.status === "OPEN") {
      fetchQrToken();
      const interval = setInterval(fetchQrToken, 15000);
      return () => clearInterval(interval);
    }
  }, [session?.status, sessionId]);

  // QR countdown timer
  useEffect(() => {
    if (session?.status === "OPEN" && qrExpiresIn > 0) {
      const timer = setInterval(() => {
        setQrExpiresIn((prev) => (prev > 1 ? prev - 1 : 30));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [session?.status, qrExpiresIn]);

  // Realtime polling sync for live student self-marks
  useEffect(() => {
    if (session?.status === "OPEN") {
      const syncInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/realtime?sessionId=${sessionId}`);
          const data = await res.json();
          if (data.success && data.data?.status === "SUBMITTED") {
            fetchSession();
          }
        } catch (e) {
          // ignore
        }
      }, 4000);
      return () => clearInterval(syncInterval);
    }
  }, [session?.status, sessionId]);

  // Toggle single record status
  const handleToggleStatus = async (studentId: string, newStatus: "PRESENT" | "ABSENT" | "LATE") => {
    if (session?.status === "SUBMITTED") return;

    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status: newStatus } : r))
    );

    try {
      await fetch(`/api/sessions/${sessionId}/records`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: [{ studentId, status: newStatus }],
        }),
      });
    } catch (err) {
      console.error("Failed to update record", err);
    }
  };

  // Mark all present
  const handleMarkAllPresent = async () => {
    if (session?.status === "SUBMITTED") return;

    setRecords((prev) => prev.map((r) => ({ ...r, status: "PRESENT" })));

    try {
      await fetch(`/api/sessions/${sessionId}/records`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: records.map((r) => ({ studentId: r.studentId, status: "PRESENT" })),
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Final submit session (irreversible lock)
  const handleSubmitSession = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/submit`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setSubmitModalOpen(false);
        fetchSession();
      } else {
        alert(data.error || "Failed to submit attendance");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Copy Summary text
  const handleCopySummary = async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/summary`);
      const data = await res.json();
      if (data.success) {
        await navigator.clipboard.writeText(data.data.summaryText);
        setCopiedStatus("summary");
        setTimeout(() => setCopiedStatus(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Copy CSV as text
  const handleCopyCsvText = async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/export.csv`);
      const csvText = await res.text();
      await navigator.clipboard.writeText(csvText);
      setCopiedStatus("csv");
      setTimeout(() => setCopiedStatus(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        <span>Loading attendance session...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8 text-center text-slate-500">
        Session not found or access denied.
      </div>
    );
  }

  const isSubmitted = session.status === "SUBMITTED";
  const total = records.length;
  const present = records.filter((r) => r.status === "PRESENT").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const late = records.filter((r) => r.status === "LATE").length;
  const presentPct = total > 0 ? ((present + late) / total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Session Metadata Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              {session.class?.name} • Period {session.periodNo}
            </span>

            {isSubmitted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Lock className="w-3.5 h-3.5" /> SUBMITTED &amp; LOCKED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                <Radio className="w-3.5 h-3.5" /> LIVE SESSION OPEN
              </span>
            )}
          </div>

          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
            {session.subject?.name} ({session.subject?.code})
          </h1>

          <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
            <span>Date: <strong className="text-slate-800">{new Date(session.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong></span>
            <span>•</span>
            <span>Time: <strong className="text-slate-800">{session.startTime} - {session.endTime}</strong></span>
            <span>•</span>
            <span>Faculty: <strong className="text-slate-800">{session.teacher?.user?.name}</strong></span>
            {isSubmitted && session.submittedAt && (
              <>
                <span>•</span>
                <span className="text-emerald-700 font-medium">Locked: {new Date(session.submittedAt).toLocaleTimeString()}</span>
              </>
            )}
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-center min-w-[5.5rem]">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Present</span>
            <span className="text-xl font-black text-emerald-600">{present}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-center min-w-[5.5rem]">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Absent</span>
            <span className="text-xl font-black text-rose-600">{absent}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-center min-w-[5.5rem]">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Rate</span>
            <span className="text-xl font-black text-indigo-600">{presentPct.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Share & Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {!isSubmitted && (
            <>
              <button
                onClick={handleMarkAllPresent}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition"
              >
                <Check className="w-4 h-4 text-emerald-600" /> Mark All Present
              </button>

              <button
                onClick={() => setShowQrModal(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1.5 transition"
              >
                <QrCode className="w-4 h-4" /> Show Live QR &amp; Code ({qrCode || "4921"})
              </button>
            </>
          )}

          {isSubmitted && (
            <>
              <a
                href={`/api/sessions/${sessionId}/export.csv`}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition shadow-sm"
              >
                <Download className="w-4 h-4" /> Download CSV
              </a>

              <button
                onClick={handleCopyCsvText}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition"
              >
                {copiedStatus === "csv" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                {copiedStatus === "csv" ? "Copied CSV!" : "Copy CSV as Text"}
              </button>

              <button
                onClick={handleCopySummary}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition"
              >
                {copiedStatus === "summary" ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-indigo-600" />}
                {copiedStatus === "summary" ? "Copied Summary!" : "Copy Summary (WhatsApp)"}
              </button>

              <a
                href={`mailto:?subject=${encodeURIComponent(`${session.subject?.code} Attendance - Period ${session.periodNo}`)}&body=${encodeURIComponent(`Attendance for ${session.class?.name} - ${session.subject?.name}: Present: ${present}/${total} (${presentPct.toFixed(1)}%), Absent: ${absent}`)}`}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition"
              >
                <Mail className="w-4 h-4 text-slate-400" /> Share via Email
              </a>
            </>
          )}
        </div>

        {/* Primary Submit Button */}
        {!isSubmitted && (
          <button
            onClick={() => setSubmitModalOpen(true)}
            className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 flex items-center gap-2 transition hover:scale-[1.02]"
          >
            <Lock className="w-4 h-4" /> Submit Attendance (One-Time Lock)
          </button>
        )}
      </div>

      {/* Attendance Grid */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="p-3.5 text-center w-12">#</th>
                <th className="p-3.5">Roll Number</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Method</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r, index) => {
                const isP = r.status === "PRESENT";
                const isA = r.status === "ABSENT";
                const isL = r.status === "LATE";

                return (
                  <tr
                    key={r.id || r.studentId}
                    className="hover:bg-slate-50/80 transition"
                  >
                    <td className="p-3.5 text-center text-slate-400 font-mono">
                      {index + 1}
                    </td>
                    <td className="p-3.5 font-bold font-mono text-slate-800">
                      {r.student?.rollNo}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      {r.student?.user?.name}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isP
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : isL
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center text-[11px] text-slate-500">
                      {r.markedBy || "TEACHER"}
                    </td>
                    <td className="p-3.5 text-right">
                      {isSubmitted ? (
                        <span className="text-[11px] text-slate-400 italic flex items-center justify-end gap-1">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      ) : (
                        <div className="inline-flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(r.studentId, "PRESENT")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${isP
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                              }`}
                          >
                            P
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(r.studentId, "LATE")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${isL
                              ? "bg-amber-600 text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                              }`}
                          >
                            L
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(r.studentId, "ABSENT")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${isA
                              ? "bg-rose-600 text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                              }`}
                          >
                            A
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal before Submit */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Submit Attendance?
              </h3>
              <p className="text-slate-600 text-sm font-medium">
                Iske baad changes nahi ho payenge. <br />
                <span className="text-emerald-700 font-bold">Present: {present}/{total} ({presentPct.toFixed(1)}%)</span> • <span className="text-rose-600 font-bold">Absent: {absent}</span>
              </p>
              <p className="text-xs text-slate-500 leading-relaxed pt-1">
                Once submitted, records are permanently immutable in the database for all roles including Admin. Confirm karo.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSubmitModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                Go Back &amp; Review
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitSession}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Finalizing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Confirm &amp; Lock Forever
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rotating QR & 4-Digit Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-sm w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-center space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Live In-Class Self Marking
              </span>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            {/* 4-digit code */}
            <div className="space-y-1">
              <span className="text-xs text-slate-500 uppercase font-semibold">4-Digit In-Class Passcode</span>
              <div className="text-5xl font-black font-mono tracking-widest text-indigo-600 bg-slate-50 py-3 rounded-2xl border border-slate-200">
                {qrCode || "4921"}
              </div>
            </div>

            {/* Rotating token countdown */}
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-slate-700 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600 animate-spin" />
              <span>Rotates every 30s: <strong className="text-indigo-900 font-mono">{qrExpiresIn}s</strong> remaining</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Students in <strong className="text-slate-900">{session.class?.name}</strong> can open their student portal and enter this 4-digit passcode or scan the code.
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
            >
              Close Display
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
