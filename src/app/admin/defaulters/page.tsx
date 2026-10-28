"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Mail,
  Loader2,
} from "lucide-react";

export default function AdminDefaultersPage() {
  const [threshold, setThreshold] = useState<number>(75);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadDefaulters(th: number) {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/defaulters?threshold=${th}`);
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
    loadDefaulters(threshold);
  }, []);

  const defaulters = data?.defaulters || [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-rose-600" /> Defaulter Screening &amp; Deficiency Audits
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Identify all students falling below the statutory attendance threshold ({threshold}%).
          </p>
        </div>

        {/* Threshold adjuster */}
        <div className="flex items-center gap-3 p-2 bg-white border border-slate-200 rounded-2xl text-xs shadow-xs">
          <span className="text-slate-600 font-semibold">Defaulter Threshold:</span>
          <select
            value={threshold}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setThreshold(val);
              loadDefaulters(val);
            }}
            className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none"
          >
            <option value="85">85% (Strict)</option>
            <option value="80">80%</option>
            <option value="75">75% (Standard University Rule)</option>
            <option value="70">70%</option>
            <option value="60">60%</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
          <span>Scanning enrollment database for defaulters...</span>
        </div>
      ) : (
        <>
          {/* Summary Metric */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Total Enrolled Evaluated</span>
              <span className="text-2xl font-black text-slate-900">{data?.totalStudentsEvaluated || 0}</span>
            </div>
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 shadow-xs">
              <span className="text-xs font-semibold text-rose-800 block mb-1">Defaulters Found</span>
              <span className="text-2xl font-black text-rose-600">{defaulters.length}</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Defaulter Percentage</span>
              <span className="text-2xl font-black text-purple-700">
                {data?.totalStudentsEvaluated > 0
                  ? ((defaulters.length / data.totalStudentsEvaluated) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
          </div>

          {/* Defaulters List */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="p-3.5">Roll No</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Class</th>
                    <th className="p-3.5 text-center">Attended</th>
                    <th className="p-3.5 text-center">Rate %</th>
                    <th className="p-3.5 text-center">Shortage</th>
                    <th className="p-3.5">Subject Deficiencies</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {defaulters.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        No students below the {threshold}% attendance threshold.
                      </td>
                    </tr>
                  ) : (
                    defaulters.map((d: any) => (
                      <tr key={d.studentId} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 font-bold font-mono text-purple-700">
                          {d.rollNo}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {d.name}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-700">
                          {d.className}
                        </td>
                        <td className="p-3.5 text-center text-slate-700 font-mono">
                          {d.attendedLectures}/{d.totalLectures}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="px-2 py-0.5 rounded text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                            {d.percentage}%
                          </span>
                        </td>
                        <td className="p-3.5 text-center text-rose-600 font-bold">
                          +{d.shortageCount} needed
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1">
                            {d.subjectBreakdown?.map((sb: any) => (
                              <span
                                key={sb.code}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono ${sb.pct < threshold
                                  ? "bg-rose-50 text-rose-700 border border-rose-200 font-bold"
                                  : "bg-slate-100 text-slate-600"
                                  }`}
                              >
                                {sb.code}: {sb.pct}%
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5 text-right">
                          <a
                            href={`mailto:${d.email}?subject=${encodeURIComponent("Urgent: Attendance Defaulter Warning Notice")}&body=${encodeURIComponent(`Dear ${d.name},\n\nYour current overall attendance is ${d.percentage}%, which is below the mandatory ${threshold}% threshold. You need to attend at least ${d.shortageCount} more lectures to regain exam eligibility.\n\nInstitutional Administration`)}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold transition"
                          >
                            <Mail className="w-3 h-3 text-rose-600" /> Send Notice
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
