"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  Download,
  Calendar,
  Filter,
  Loader2,
} from "lucide-react";

export default function StudentHistoryPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    async function fetchAttendance() {
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

    fetchAttendance();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
        <span>Loading personal lecture history...</span>
      </div>
    );
  }

  const history: any[] = data?.history || [];
  const subjectStats: any[] = data?.subjectStats || [];

  const filteredHistory = history.filter((h) => {
    if (filterSubject !== "ALL" && h.subjectCode !== filterSubject) return false;
    if (filterStatus !== "ALL" && h.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title & Download */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-emerald-600" /> My Attendance History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Strictly isolated to your own verified attendance records.
          </p>
        </div>

        <a
          href="/api/student/attendance.csv"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition"
        >
          <Download className="w-4 h-4" /> Download Personal CSV
        </a>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl text-xs shadow-xs">
        <div className="flex items-center gap-2 text-slate-600 font-semibold">
          <Filter className="w-4 h-4 text-emerald-600" /> Filters:
        </div>

        <div>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="ALL">All Enrolled Subjects</option>
            {subjectStats.map((s) => (
              <option key={s.subjectCode} value={s.subjectCode}>
                {s.subjectCode} - {s.subjectName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present Only</option>
            <option value="ABSENT">Absent Only</option>
            <option value="LATE">Late Only</option>
            <option value="APPROVED_LEAVE">Approved Leave</option>
          </select>
        </div>

        <span className="text-slate-400 text-[11px] ml-auto">
          Showing {filteredHistory.length} of {history.length} lectures
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Period &amp; Time</th>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Mark Method</th>
                <th className="p-3.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No attendance records match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((rec) => {
                  const isP = rec.status === "PRESENT";
                  const isA = rec.status === "ABSENT";
                  const isL = rec.status === "LATE";
                  const isLeave = rec.status === "APPROVED_LEAVE";

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(rec.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-3.5 text-slate-700 font-mono">
                        P{rec.periodNo} ({rec.timeSlot})
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-900 block">
                          {rec.subjectName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {rec.subjectCode}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isP
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isL
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : isLeave
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center text-slate-500 text-[11px]">
                        {rec.markedBy || "TEACHER"}
                      </td>
                      <td className="p-3.5 text-right text-slate-500 font-mono text-[11px]">
                        {rec.markedAt ? new Date(rec.markedAt).toLocaleTimeString() : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
