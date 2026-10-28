"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Briefcase,
  Radio,
  AlertTriangle,
  History,
  Loader2,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [defaultersData, setDefaultersData] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [uRes, sRes, dRes, aRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/sessions"),
          fetch("/api/admin/defaulters?threshold=75"),
          fetch("/api/admin/audit-log"),
        ]);

        const [uData, sData, dData, aData] = await Promise.all([
          uRes.json(),
          sRes.json(),
          dRes.json(),
          aRes.json(),
        ]);

        if (uData.success) setUsers(uData.data || []);
        if (sData.success) setSessions(sData.data || []);
        if (dData.success) setDefaultersData(dData.data || null);
        if (aData.success) setAuditLogs(aData.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
        <span>Loading institutional telemetry...</span>
      </div>
    );
  }

  const studentCount = users.filter((u) => u.role === "STUDENT").length;
  const teacherCount = users.filter((u) => u.role === "TEACHER").length;
  const liveSessions = sessions.filter((s) => s.status === "OPEN");
  const defaulterCount = defaultersData?.defaulterCount || 0;

  return (
    <div className="space-y-8">
      {/* Title & System Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
            Administrative Master Portal
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            Institutional Oversight &amp; Auditing
          </h1>
          <p className="text-slate-500 text-xs">
            Complete institutional directory, immutable session audits, defaulter screening (&lt;75%), and system logs.
          </p>
        </div>

        <Link
          href="/admin/health"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-emerald-700 hover:border-slate-300 transition shadow-xs"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          System Status: Healthy
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            Enrolled Students <GraduationCap className="w-4 h-4 text-emerald-600" />
          </span>
          <span className="text-3xl font-black text-slate-900">{studentCount}</span>
          <Link href="/admin/students" className="text-[11px] text-emerald-700 font-semibold hover:underline">
            Manage Directory →
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            Active Teachers <Briefcase className="w-4 h-4 text-indigo-600" />
          </span>
          <span className="text-3xl font-black text-slate-900">{teacherCount}</span>
          <Link href="/admin/teachers" className="text-[11px] text-indigo-700 font-semibold hover:underline">
            Manage Faculty →
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            Live Lectures <Radio className="w-4 h-4 text-amber-600 animate-pulse" />
          </span>
          <span className="text-3xl font-black text-amber-600">{liveSessions.length}</span>
          <Link href="/admin/sessions" className="text-[11px] text-amber-700 font-semibold hover:underline">
            View Live Sessions →
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            Defaulters (&lt;75%) <AlertTriangle className="w-4 h-4 text-rose-600" />
          </span>
          <span className="text-3xl font-black text-rose-600">{defaulterCount}</span>
          <Link href="/admin/defaulters" className="text-[11px] text-rose-700 font-semibold hover:underline">
            View Defaulters Report →
          </Link>
        </div>
      </div>

      {/* 2-Column Split: Defaulters Snapshot & Live Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Defaulters Screening Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Defaulter Screening (&lt;75%)
            </h2>
            <Link href="/admin/defaulters" className="text-xs text-rose-700 hover:underline font-semibold">
              Full List ({defaulterCount}) →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {defaulterCount === 0 ? (
              <p className="text-slate-400 text-xs py-4 text-center">
                All students currently maintain &ge; 75% attendance!
              </p>
            ) : (
              (defaultersData?.defaulters || []).slice(0, 5).map((d: any) => (
                <div key={d.studentId} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{d.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {d.rollNo} • {d.className}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      {d.percentage}%
                    </span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      Short by {d.shortageCount} lectures
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Audit Log Preview */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-purple-600" /> Recent Mutation Audit Logs
            </h2>
            <Link href="/admin/audit-log" className="text-xs text-purple-700 hover:underline font-semibold">
              View All Logs ({auditLogs.length}) →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.slice(0, 5).map((log: any) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-800">
                    {log.action}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    By: {log.user?.name || log.role || "SYSTEM"} • Entity: {log.entityType}
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-400 font-mono">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
