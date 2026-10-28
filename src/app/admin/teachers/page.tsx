"use client";

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Loader2,
  Mail,
} from "lucide-react";

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeachers() {
      try {
        const res = await fetch("/api/admin/teachers");
        const json = await res.json();
        if (json.success) setTeachers(json.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadTeachers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
        <span>Loading faculty directory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Briefcase className="w-6 h-6 text-purple-600" /> Faculty &amp; Assigned Subjects
        </h1>
        <p className="text-xs text-slate-500">
          Faculty directory, departmental assignments, and lecture history statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((t) => (
          <div
            key={t.id}
            className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  {t.employeeId}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">{t.user?.name}</h3>
                <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {t.user?.email}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-500">
                <span>Department:</span>
                <span className="font-semibold text-slate-800">{t.department || "General"}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Assigned Subjects:</span>
                <span className="font-semibold text-slate-800">{t.subjects?.length || 0}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Total Sessions Conducted:</span>
                <span className="font-bold text-purple-700">{t._count?.sessions || 0}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Teaching Subjects:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {t.subjects?.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">None assigned</span>
                ) : (
                  t.subjects.map((sub: any) => (
                    <span
                      key={sub.id}
                      className="px-2 py-1 rounded-lg bg-slate-100 text-[10px] font-semibold text-slate-700 border border-slate-200"
                    >
                      {sub.code} ({sub.class?.name})
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
