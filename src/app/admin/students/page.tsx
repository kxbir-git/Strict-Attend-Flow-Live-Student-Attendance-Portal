"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Upload,
  AlertTriangle,
  Filter,
  Loader2,
  X,
} from "lucide-react";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);

  async function loadData() {
    try {
      const [sRes, cRes] = await Promise.all([
        fetch("/api/admin/students"),
        fetch("/api/admin/classes"),
      ]);
      const [sData, cData] = await Promise.all([sRes.json(), cRes.json()]);
      if (sData.success) setStudents(sData.data || []);
      if (cData.success) setClasses(cData.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredStudents = students.filter((s) => {
    if (selectedClass !== "ALL" && s.classId !== selectedClass) return false;
    return true;
  });

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImporting(true);
    setImportResult(null);

    try {
      const res = await fetch("/api/admin/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText }),
      });

      const data = await res.json();
      setImportResult(data);
      if (data.success) {
        setCsvText("");
        loadData();
      }
    } catch (err: any) {
      setImportResult({ success: false, error: err.message });
    } finally {
      setImporting(false);
    }
  };

  const sampleCsvTemplate = `Name,Email,RollNo,Class
Rohan Sen,rohan.sen@portal.edu,BCA3A-055,BCA-3A
Kiran Bedi,kiran.bedi@portal.edu,BCA3A-056,BCA-3A`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
        <span>Loading student records...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Import/Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-purple-600" /> Student Directory &amp; Bulk Ingestion
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete list of enrolled students, live attendance metrics, and bulk CSV enrollment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setImportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20 transition"
          >
            <Upload className="w-4 h-4" /> Bulk Import (CSV)
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl text-xs shadow-xs">
        <div className="flex items-center gap-2 text-slate-600 font-semibold">
          <Filter className="w-4 h-4 text-purple-600" /> Filter by Class:
        </div>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
        >
          <option value="ALL">All Classes ({students.length})</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.department})
            </option>
          ))}
        </select>

        <span className="text-slate-400 text-[11px] ml-auto">
          Displaying {filteredStudents.length} students
        </span>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="p-3.5">Roll No</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Class</th>
                <th className="p-3.5">Institutional Email</th>
                <th className="p-3.5 text-center">Attended</th>
                <th className="p-3.5 text-center">Rate %</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => {
                const isDefaulter = s.isDefaulter;

                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-bold font-mono text-purple-700">
                      {s.rollNo}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{s.name}</td>
                    <td className="p-3.5 font-semibold text-slate-700">
                      {s.className} ({s.section})
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                      {s.email}
                    </td>
                    <td className="p-3.5 text-center text-slate-700 font-mono">
                      {s.attendedLectures}/{s.totalLectures}
                    </td>
                    <td className="p-3.5 text-center font-black">
                      <span
                        className={
                          isDefaulter ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"
                        }
                      >
                        {s.percentage}%
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {isDefaulter ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3" /> Defaulter
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Safe
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk CSV Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Bulk CSV Student Ingestion</h3>
                <p className="text-xs text-slate-500">
                  Paste CSV rows below or download sample format.
                </p>
              </div>
              <button onClick={() => setImportModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {importResult && (
              <div
                className={`p-3 rounded-xl text-xs ${importResult.success
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border border-rose-200 text-rose-800"
                  }`}
              >
                {importResult.message || importResult.error}
              </div>
            )}

            <form onSubmit={handleBulkImport} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  CSV Data (Columns: Name, Email, RollNo, Class)
                </label>
                <button
                  type="button"
                  onClick={() => setCsvText(sampleCsvTemplate)}
                  className="text-[11px] text-purple-700 hover:underline font-semibold"
                >
                  Load Sample Template
                </button>
              </div>

              <textarea
                rows={8}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={sampleCsvTemplate}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white"
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={importing || !csvText.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5"
                >
                  {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Start Ingestion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
