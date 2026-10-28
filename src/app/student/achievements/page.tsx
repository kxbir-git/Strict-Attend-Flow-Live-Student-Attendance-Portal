"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  Award,
  Target,
  Users,
  Shield,
  CheckCircle2,
  TrendingUp,
  Zap,
} from "lucide-react";

export default function StudentAchievementsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/insights")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const BADGE_DEFINITIONS: Record<
    string,
    { title: string; desc: string; icon: any; color: string }
  > = {
    EARLY_BIRD: {
      title: "Early Bird",
      desc: "Marked attendance within 2 minutes of session start",
      icon: Zap,
      color: "text-amber-700 bg-amber-50 border-amber-200",
    },
    NEVER_LATE: {
      title: "Never Late",
      desc: "Maintained punctuality with 0 recorded late marks",
      icon: CheckCircle2,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    PERFECT_MONTH: {
      title: "Perfect Month",
      desc: "Achieved >= 90% attendance across all subjects",
      icon: Award,
      color: "text-purple-700 bg-purple-50 border-purple-200",
    },
    COMEBACK: {
      title: "Comeback Hero",
      desc: "Recovered from defaulter risk (<75%) to safe zone",
      icon: TrendingUp,
      color: "text-sky-700 bg-sky-50 border-sky-200",
    },
    STREAK_10: {
      title: "10-Day Streak",
      desc: "10 consecutive lectures attended without missing a class",
      icon: Flame,
      color: "text-orange-700 bg-orange-50 border-orange-200",
    },
    STREAK_50: {
      title: "Century Club (50 Streak)",
      desc: "50 consecutive classes attended with zero absences",
      icon: Flame,
      color: "text-rose-700 bg-rose-50 border-rose-200",
    },
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading Gamification &amp; Milestones...
      </div>
    );
  }

  const overall = data?.overall || {};
  const streak = data?.streak || { currentStreak: 0, longestStreak: 0 };
  const badges = data?.badges || [];
  const percentile = data?.peerPercentile || 50;

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <Award className="w-6 h-6 text-amber-500" />
          Milestones, Streaks &amp; Goals
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Gamified attendance habits, privacy-respecting percentile comparison, and personal goal progress.
        </p>
      </div>

      {/* Top 3 KPI Cards: Streak, Peer Percentile, Personal Goal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Streak Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Active Streak
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 flex items-baseline gap-2">
            {streak.currentStreak}{" "}
            <span className="text-xs font-semibold text-slate-500">lectures</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Personal best: <strong className="text-slate-800">{streak.longestStreak}</strong> consecutive lectures attended.
          </p>
        </div>

        {/* Anonymized Peer Comparison Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Peer Standing
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            Top {100 - percentile + 1}%
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Higher attendance than <strong className="text-indigo-700">{percentile}%</strong> of peers in your division (anonymized).
          </p>
        </div>

        {/* Personal Target Goal */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Target Goal
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{overall.percentage}%</span>
            <span className="text-xs font-mono text-slate-500">Goal: {overall.targetPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden border border-slate-200">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (overall.percentage / (overall.targetPercent || 75)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Earned Badges Showcase */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          Earned Badges &amp; Recognitions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(BADGE_DEFINITIONS).map(([key, def]) => {
            const isEarned = badges.includes(key);
            const Icon = def.icon;
            return (
              <div
                key={key}
                className={`p-4 rounded-xl border transition ${isEarned
                    ? `${def.color}`
                    : "bg-slate-50 border-slate-200 opacity-50 grayscale"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{def.title}</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                      {isEarned ? "Unlocked" : "Locked"}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-2.5">{def.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Buffer Tracking Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            Attendance Insurance &amp; Buffer Breakdown
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time calculation of how many lectures you can afford to miss per subject before breaching 75%.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4 text-center">Attended / Held</th>
                <th className="py-3 px-4 text-right">Current %</th>
                <th className="py-3 px-4 text-center">Buffer Status</th>
                <th className="py-3 px-4 text-right">Spare Absences</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.subjects?.map((sub: any) => (
                <tr key={sub.subjectId} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-semibold text-slate-900">{sub.subjectName}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{sub.subjectCode}</td>
                  <td className="py-3 px-4 text-center text-slate-700">
                    {sub.attended} / {sub.totalHeld}
                  </td>
                  <td className="py-3 px-4 text-right font-bold">
                    <span
                      className={sub.percentage >= 75 ? "text-emerald-600" : "text-rose-600"}
                    >
                      {sub.percentage}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${sub.bufferStatus === "GREEN"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : sub.bufferStatus === "YELLOW"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                    >
                      {sub.bufferStatus === "GREEN"
                        ? "Safe"
                        : sub.bufferStatus === "YELLOW"
                          ? "Caution"
                          : "Critical"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {sub.isDefaulter ? (
                      <span className="text-rose-600 font-bold">
                        Need +{sub.classesNeededToRecover} classes
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold">
                        {sub.bufferAbsences} spare {sub.bufferAbsences === 1 ? "absence" : "absences"}
                      </span>
                    )}
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
