"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch("/api/sessions");
        const data = await res.json();
        if (data.success) {
          setSessions(data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadSessions();
  }, []);

  const filteredSessions = sessions.filter((s) => {
    if (filterStatus !== "ALL" && s.status !== filterStatus) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
        <span>Loading institutional sessions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-purple-600" /> All Attendance Sessions (Read-Only)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional ledger of all lecture sessions. Submitted sessions are permanently locked against modifications.
          </p>
        </div>

        <a
          href="/api/admin/reports?format=csv"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition"
        >
          <Download className="w-4 h-4" /> Bulk Export CSV
        </a>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl text-xs shadow-xs">
        <div className="flex items-center gap-2 text-slate-600 font-semibold">
          <Filter className="w-4 h-4 text-purple-600" /> Status:
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
        >
          <option value="ALL">All Sessions ({sessions.length})</option>
          <option value="SUBMITTED">Submitted / Locked</option>
          <option value="OPEN">Open (Live Now)</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Period</th>
                <th className="p-3.5">Class</th>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5">Faculty</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSessions.map((sess) => {
                const dateStr = new Date(sess.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                const isSub = sess.status === "SUBMITTED";

                return (
                  <tr key={sess.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {dateStr}
                    </td>
                    <td className="p-3.5 text-slate-600 font-mono">
                      P{sess.periodNo} ({sess.startTime} - {sess.endTime})
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">
                      {sess.class?.name}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-900 block">
                        {sess.subject?.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {sess.subject?.code}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      {sess.teacher?.user?.name}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isSub
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                      >
                        {isSub ? "LOCKED" : "LIVE NOW"}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      {isSub && (
                        <a
                          href={`/api/sessions/${sess.id}/export.csv`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold transition"
                        >
                          <Download className="w-3 h-3" /> CSV
                        </a>
                      )}
                      <Link
                        href={`/admin/sessions/${sess.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold transition"
                      >
                        Inspect <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
