"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Database,
  Cpu,
  Clock,
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Play,
} from "lucide-react";

export default function AdminHealthPage() {
  const [health, setHealth] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggeringCron, setTriggeringCron] = useState(false);
  const [cronMessage, setCronMessage] = useState<string | null>(null);

  async function checkHealth() {
    try {
      setLoading(true);
      const res = await fetch("/api/health");
      const json = await res.json();
      setHealth(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkHealth();
  }, []);

  const handleTriggerAutoSubmitCron = async () => {
    setTriggeringCron(true);
    setCronMessage(null);
    try {
      const res = await fetch("/api/cron/auto-submit", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setCronMessage(`Auto-submit job executed! Evaluated: ${json.evaluatedCount}, Auto-submitted: ${json.autoSubmittedCount}`);
        checkHealth();
      } else {
        setCronMessage(`Failed: ${json.error}`);
      }
    } catch (err: any) {
      setCronMessage(`Error: ${err.message}`);
    } finally {
      setTriggeringCron(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-emerald-600" /> System Telemetry & Cluster Health
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status of PostgreSQL connection, memory footprints, and auto-submit safety net cron jobs.
          </p>
        </div>

        <button
          onClick={checkHealth}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition"
        >
          <RefreshCw className="w-4 h-4 text-purple-600" /> Ping Health Check
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
          <span>Querying subsystem health metrics...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Database Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-600" /> PostgreSQL DB
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {health?.database?.status || "Healthy"}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {health?.database?.latencyMs} ms
              </div>
              <p className="text-[11px] text-slate-500">
                Connection pool active. Schema synchronized via Prisma ORM.
              </p>
            </div>

            {/* Cron Worker Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" /> Auto-Submit Safety Net
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900">
                Slot End + 15m
              </div>
              <p className="text-[11px] text-slate-500">
                Auto-submits unfinalized open sessions if slot end time exceeds 15 minutes.
              </p>
            </div>

            {/* Memory & Uptime Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-600" /> Node V8 Memory
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                  {health?.system?.platform}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {health?.system?.memory?.heapUsedMB} MB
              </div>
              <p className="text-[11px] text-slate-500">
                Total Heap: {health?.system?.memory?.heapTotalMB} MB • Uptime: {Math.round(health?.uptime || 0)}s
              </p>
            </div>
          </div>

          {/* Cron Trigger Console */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" /> Auto-Submit Safety Net Test Trigger
                </h3>
                <p className="text-xs text-slate-500">
                  Manually invoke the background auto-submit daemon right now to process any expired open sessions.
                </p>
              </div>

              <button
                onClick={handleTriggerAutoSubmitCron}
                disabled={triggeringCron}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white transition shadow-sm"
              >
                {triggeringCron ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Running Cron Worker...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Trigger Auto-Submit Cron
                  </>
                )}
              </button>
            </div>

            {cronMessage && (
              <div className="p-3 bg-slate-50 rounded-xl font-mono text-xs text-emerald-700 border border-slate-200">
                {cronMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
