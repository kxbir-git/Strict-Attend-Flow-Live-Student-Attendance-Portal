"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Lock,
  Download,
  Loader2,
  Share2,
  Check,
} from "lucide-react";

export default function AdminSessionDetailPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        const data = await res.json();
        if (data.success) {
          setSession(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [sessionId]);

  const handleCopySummary = async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/summary`);
      const data = await res.json();
      if (data.success) {
        await navigator.clipboard.writeText(data.data.summaryText);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
        <span>Loading session audit...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8 text-center text-slate-500">
        Session not found.
      </div>
    );
  }

  const records = session.records || [];
  const total = records.length;
  const present = records.filter((r: any) => r.status === "PRESENT").length;
  const absent = records.filter((r: any) => r.status === "ABSENT").length;
  const late = records.filter((r: any) => r.status === "LATE").length;
  const rate = total > 0 ? ((present + late) / total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Strict Lock Banner */}
      <div className="p-4 rounded-2xl bg-white border border-purple-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              ADMIN AUDIT INSPECTION • STRICT READ-ONLY
            </h3>
            <p className="text-xs text-slate-500">
              Per architectural security policy, submitted records are immutable for all roles including Administrator.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {session.status === "SUBMITTED" && (
            <a
              href={`/api/sessions/${sessionId}/export.csv`}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <Download className="w-4 h-4" /> Download CSV
            </a>
          )}
          <button
            onClick={handleCopySummary}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-purple-600" />}
            {copied ? "Copied!" : "Copy Summary"}
          </button>
        </div>
      </div>

      {/* Session Metadata Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
              {session.class?.name} • Period {session.periodNo}
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              {session.subject?.name} ({session.subject?.code})
            </h1>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
              <span>Date: {new Date(session.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              <span>•</span>
              <span>Time: {session.startTime} - {session.endTime}</span>
              <span>•</span>
              <span>Faculty: {session.teacher?.user?.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-center">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl min-w-[5rem]">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Present</span>
              <span className="text-lg font-bold text-emerald-600">{present}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl min-w-[5rem]">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Absent</span>
              <span className="text-lg font-bold text-rose-600">{absent}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl min-w-[5rem]">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Rate</span>
              <span className="text-lg font-bold text-purple-700">{rate.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="p-3.5">Roll No</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Mark Method</th>
                <th className="p-3.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5 font-mono font-bold text-purple-700">
                    {r.student?.rollNo}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">
                    {r.student?.user?.name}
                  </td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${r.status === "PRESENT"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : r.status === "LATE"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-center text-slate-500 text-[11px]">
                    {r.markedBy || "TEACHER"}
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-500 text-[11px]">
                    {r.markedAt ? new Date(r.markedAt).toLocaleTimeString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
