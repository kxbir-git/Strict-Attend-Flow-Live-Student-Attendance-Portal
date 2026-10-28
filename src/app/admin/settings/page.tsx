"use client";

import React, { useState } from "react";
import { Settings, Shield, Sliders, Calendar, CheckCircle2, Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [threshold, setThreshold] = useState("75");
  const [semesterStart, setSemesterStart] = useState("2026-07-15");
  const [semesterEnd, setSemesterEnd] = useState("2026-12-15");
  const [autoSubmitMinutes, setAutoSubmitMinutes] = useState("15");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setMessage("Institutional parameters updated successfully.");
    }, 600);
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-purple-600" />
          Institutional Governance &amp; Policy Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure semester date bounds, minimum attendance compliance criteria, and system automation timers.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Compliance Threshold */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Mandatory Defaulter Threshold</h2>
              <p className="text-xs text-slate-500">
                Students below this percentage are automatically flagged as defaulters and barred from exam hall tickets.
              </p>
            </div>
          </div>

          <div className="pt-2 max-w-xs space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Minimum Attendance Required (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={50}
                max={95}
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-32 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:border-purple-600 focus:bg-white"
              />
              <span className="text-slate-500 text-sm font-bold">%</span>
            </div>
          </div>
        </div>

        {/* Semester Calendar Bounds */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Academic Semester Term Dates</h2>
              <p className="text-xs text-slate-500">
                Attendance calculation period bounds for the active semester term.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Semester Commencement Date
              </label>
              <input
                type="date"
                value={semesterStart}
                onChange={(e) => setSemesterStart(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-purple-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Semester Conclusion Date
              </label>
              <input
                type="date"
                value={semesterEnd}
                onChange={(e) => setSemesterEnd(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-purple-600 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Auto Submit Timer Safety Net */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Background Auto-Submit Safety Net</h2>
              <p className="text-xs text-slate-500">
                Minutes after period end before an OPEN session is automatically finalized and locked by cron.
              </p>
            </div>
          </div>

          <div className="pt-2 max-w-xs space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Auto-Submit Grace Window (Minutes)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={5}
                max={60}
                value={autoSubmitMinutes}
                onChange={(e) => setAutoSubmitMinutes(e.target.value)}
                className="w-32 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:border-purple-600 focus:bg-white"
              />
              <span className="text-slate-500 text-xs">minutes after period endTime</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md shadow-purple-600/20 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Institutional Parameters"}
          </button>
        </div>
      </form>
    </div>
  );
}
