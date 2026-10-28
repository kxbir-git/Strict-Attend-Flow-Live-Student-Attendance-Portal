"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Globe,
  Bell,
  Mail,
  Target,
  Save,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function StudentSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [language, setLanguage] = useState("en");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [parentEmailEnabled, setParentEmailEnabled] = useState(false);
  const [parentEmail, setParentEmail] = useState("");
  const [goalPercent, setGoalPercent] = useState(75);
  const [studentRoll, setStudentRoll] = useState("");

  const LANGUAGES = [
    { code: "en", name: "English (Default)" },
    { code: "hi", name: "हिंदी (Hindi)" },
    { code: "mr", name: "मराठी (Marathi)" },
    { code: "ta", name: "தமிழ் (Tamil)" },
    { code: "te", name: "తెలుగు (Telugu)" },
    { code: "bn", name: "বাংলা (Bengali)" },
  ];

  useEffect(() => {
    fetch("/api/student/settings")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          const d = res.data;
          setLanguage(d.language || "en");
          setNotificationsEnabled(d.notificationsEnabled ?? true);
          setParentEmailEnabled(d.parentEmailEnabled ?? !!d.parentEmail);
          setParentEmail(d.parentEmail || "");
          setGoalPercent(d.goalPercent || 75);
          setStudentRoll(d.rollNo || "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/student/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          notificationsEnabled,
          parentEmailEnabled,
          parentEmail: parentEmail || null,
          goalPercent,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Settings and preferences saved successfully!");
      } else {
        alert(data.message || data.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-emerald-600" />
          Settings &amp; Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize interface language, attendance target goals, parent digests, and alert settings.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Language Selection */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Portal Display Language</h2>
              <p className="text-xs text-slate-500">
                Choose your preferred UI language. Teacher timetable entries remain in their original script.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {LANGUAGES.map((l) => (
              <button
                type="button"
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition ${language === l.code
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>

        {/* Personal Target Goal */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Personal Attendance Goal</h2>
              <p className="text-xs text-slate-500">
                Institutional minimum is 75%. You can set an aspirational personal goal (e.g. 85% or 90%).
              </p>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Selected Goal:</span>
              <span className="font-extrabold text-base text-emerald-600 font-mono">
                {goalPercent}%
              </span>
            </div>
            <input
              type="range"
              min={75}
              max={100}
              step={1}
              value={goalPercent}
              onChange={(e) => setGoalPercent(Number(e.target.value))}
              className="w-full accent-emerald-600 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>75% (Mandatory Minimum)</span>
              <span>85%</span>
              <span>100% (Perfect)</span>
            </div>
          </div>
        </div>

        {/* Parent / Guardian Digest */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Parent / Guardian Access (Opt-in)</h2>
                <p className="text-xs text-slate-500">
                  Allow your parent or guardian to view your attendance percentage via a secure read-only magic link.
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={parentEmailEnabled}
              onChange={(e) => setParentEmailEnabled(e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-600"
            />
          </div>

          {parentEmailEnabled && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parent / Guardian Email
                </label>
                <input
                  type="email"
                  placeholder="parent.email@example.com"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              {studentRoll && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <span className="text-slate-500">Preview Parent Magic-Link:</span>
                  <Link
                    href={`/parent/${studentRoll}`}
                    target="_blank"
                    className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-semibold"
                  >
                    Open Parent Portal <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications & PWA */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Browser &amp; In-App Notifications</h2>
                <p className="text-xs text-slate-500">
                  Receive live alerts when lecture attendance sessions start and attendance dips below 75%.
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-600"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </form>
    </div>
  );
}
